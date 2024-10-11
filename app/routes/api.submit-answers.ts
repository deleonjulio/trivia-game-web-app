import { json } from "@remix-run/node";
import type { ActionFunction } from "@remix-run/node";
import { LEVELS_DB } from "../../server/dummyDb";

interface SubmittedAnswer {
  id: string;
  answer: string;
}

interface SubmittedData {
  id: number;
  questions: SubmittedAnswer[];
}

export const action: ActionFunction = async ({ request }) => {
  try {
    const submittedData: SubmittedData = await request.json();

    const triviaIsFound = LEVELS_DB.find((level) => level.id === submittedData.id);
    let score = 0
    if (triviaIsFound) {
      submittedData.questions.forEach(submittedQuestion => {
        const correctQuestion = triviaIsFound.questions.find(q => q.id.toString() === submittedQuestion.id);
        score = submittedQuestion.answer === correctQuestion?.correctAnswer ? score + 1 : score;
      });

      return json({ 
        message: "Answers submitted successfully",
        score,
      }, { status: 200 });
    } else {
      return json({ message: "Trivia not found" }, { status: 404 });
    }
  } catch (error) {
    console.error("Error submitting answers:", error);
    return json({ message: "Error submitting answers", error: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
};