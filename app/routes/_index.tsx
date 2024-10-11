import { json } from "@remix-run/node";
import { useLoaderData, useNavigate } from "@remix-run/react";
import type { LoaderFunction } from "@remix-run/node";
import type { TriviaQuestion } from "../../server/triviaQuestions";

type LoaderData = {
  levels: TriviaQuestion[];
};

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  const baseUrl = `${url.protocol}//${url.host}`;
  const response = await fetch(`${baseUrl}/api/trivia-questions`);
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const levels = await response.json();
  return json({ levels });
};

export default function Trivia() {
  const navigate = useNavigate();
  const { levels } = useLoaderData<LoaderData>();

  const colorHandler = (level: string) => {
    switch (level) {
      case "easy": return "text-green-500";
      case "medium": return "text-yellow-500";
      case "hard": return "text-red-500";
    }
  }
  
  return (
    <div className="flex flex-col items-center justify-center h-screen min-h-screen bg-gray-100">
      <h1 className="text-2xl font-bold pb-4">Select a level</h1>
      <ul className="flex flex-col gap-4 items-center">
        {levels.map((q) => (
          <li key={q.id}>
            <button onClick={() =>  navigate(`trivia/${q.id}`)} className={`font-bold ${colorHandler(q.id)} bg-white p-2 rounded-md hover:bg-gray-300 `}>{q.id.toUpperCase()}</button>
          </li>
        ))}
      </ul>
    </div>
  );
}