import vision from '@google-cloud/vision';
import { NextApiRequest, NextApiResponse } from 'next';
import pdfParse from 'pdf-parse';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== 'POST') {
      console.log('Received non-POST request');
      return res.status(405).json({ message: 'Method not allowed' }); // Only POST requests are allowed
    }

    const file = req.body.file; // The file data is in the body of the POST request
    if (!file) {
      console.log('No file data found in request');
      return res.status(400).json({ message: 'No file data found in request' });
    }

    const fileType = req.body.fileType; // The file type (image or pdf) is in the body of the POST request
    if (!fileType) {
      console.log('No file type found in request');
      return res.status(400).json({ message: 'No file type found in request' });
    }

    let text;
    if (fileType === 'image') {
      const credentialsBase64 = process.env.GOOGLE_APPLICATION_CREDENTIALS_BASE64;
      if (!credentialsBase64) {
        console.error('GOOGLE_APPLICATION_CREDENTIALS_BASE64 is not set');
        return res.status(500).json({ message: 'Internal server error' });
      }

      const credentials = JSON.parse(Buffer.from(credentialsBase64, 'base64').toString());

      const client = new vision.ImageAnnotatorClient({
        credentials
      });

      const [result] = await client.textDetection(Buffer.from(file.split('base64,')[1], 'base64'));
      if (!result) {
        console.log('No result from text detection');
        return res.status(500).json({ message: 'No result from text detection' });
      }

      const detections = result.textAnnotations;
      if (!detections || detections.length === 0) {
        console.log('No text annotations found in result');
        return res.status(500).json({ message: 'No text annotations found in result' });
      }

      text = detections[0].description;
    } else if (fileType === 'pdf') {
      const dataBuffer = Buffer.from(file.split('base64,')[1], 'base64');
      const data = await pdfParse(dataBuffer);
      text = data.text;
    } else {
      console.log('Unsupported file type');
      return res.status(400).json({ message: 'Unsupported file type' });
    }

    res.status(200).json({ text });
  } catch (error: unknown) {
    console.error('Error in OCR handler:', error);
    if (error instanceof Error) {
      res.status(500).json({ message: 'Internal server error', error: error.message });
    } else {
      res.status(500).json({ message: 'Internal server error' });
    }
  }
}