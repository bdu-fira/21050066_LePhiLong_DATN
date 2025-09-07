import { Exercise } from './exercise.entity';
import { EvaluationCriteria } from './evaluationcriteria.entity';
export declare class Position {
    id: number;
    exerciseID: number;
    name: string;
    order: number;
    exercise: Exercise;
    evaluationCriteria: EvaluationCriteria[];
}
