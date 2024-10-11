import { json } from "@remix-run/node";
import type { LoaderFunction } from "@remix-run/node";
import { getTriviaQuestions } from "../../server/triviaQuestions";

export const loader: LoaderFunction = async ({ params }) => {
  const { level } = params;
  const questions = getTriviaQuestions(level as string);
  return json(questions);
};