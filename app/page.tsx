import { ChatWindow } from "@/components/ChatWindow";

export default function AgentsPage() {
  const InfoCard = (
    <div className="p-4 md:p-8 rounded bg-[#25252d] w-full max-h-[85%] overflow-hidden">
      <h1 className="text-3xl md:text-4xl mb-4">
        🏠 RentPaca: Extracting Key Data from Rental Agreements 📑🔍
      </h1>
      <ul>
        <li className="text-l">
          📄
          <span className="ml-2">
            Specialized in parsing rental agreements to extract crucial data like tenant and landlord names, address, rent amount, deposit, and guarantee status.
          </span>
        </li>
        <li className="text-l">
          🤖
          <span className="ml-2">
            Powered by OpenAI and LangChain.js, we provide precise and reliable JSON formatted outputs.
          </span>
        </li>
        <li className="text-l">
          🛠️
          <span className="ml-2">
            Core logic can be found in <code>app/api/chat/structured_output/route.ts</code>.
          </span>
        </li>

        <li className="text-l">
          📊
          <span className="ml-2">
            Outputs a JSON object containing extracted fields.
          </span>
        </li>
        <li className="text-l">
          👇
          <span className="ml-2">
            Type below to get your rental agreement data parsed into JSON format.
          </span>
        </li>
      </ul>
    </div>
  );

  return (
    <ChatWindow
      endpoint="api/chat/structured_output"
      emptyStateComponent={InfoCard}
      placeholder={`Bitte laden Sie ein Bild hoch`}
      emoji="🏠"
      titleText="Rental Agreement Extractor"
    ></ChatWindow>
  );
}