import { Position } from './position.entity';
import { Joint } from './joint.entity';
export declare class EvaluationCriteria {
    id: number;
    positionID: number;
    operator: string;
    angle: number | null;
    errorMessage: string | null;
    position: Position;
    joints: Joint[];
}
