import { LEVELS_DB } from "./dummyDb";

const LEVEL_LIST = [
    {
        id: 'easy',
    },
    {
        id: 'medium',
    },
    {
        id: 'hard',
    }
]

export interface TriviaQuestion {
    id: string;
    question: string;
    options: string[];
}

export interface TriviaLevel {
    id: string;
}

export interface QuestionList {
    id: number;
    level: string;
    questions: TriviaQuestion[];
}

export function getTriviaLevels(): TriviaLevel[] {
    return LEVEL_LIST;
}

export function getTriviaQuestions(level: string): QuestionList {
    const list = LEVELS_DB.filter(levelsInfo => levelsInfo?.level === level);
    const listCount = list.length;

    const randomIndex = Math.floor(Math.random() * listCount);
    const selectedLevel = list[randomIndex];

    const triviaLevel: QuestionList = {
        id: selectedLevel.id,
        level: selectedLevel.level,
        questions: selectedLevel.questions.map(({ id, question, options }) => ({
            id: id.toString(),
            question,
            options
        }))
    };
    
    return triviaLevel;
}