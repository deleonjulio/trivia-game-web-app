import { json } from "@remix-run/node";
import type { LoaderFunction } from "@remix-run/node";
import { getTriviaLevels } from "../../server/triviaQuestions";

export const loader: LoaderFunction = async () => {
  const levels = getTriviaLevels();
  return json(levels);
};