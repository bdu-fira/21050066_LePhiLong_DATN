import { ScheduleDetail } from './scheduledetail.entity';
import { JointList } from './jointList.entity';
export declare class Result {
    id: number;
    scheduleDetailID: number;
    set: number;
    rep: number;
    positionName: string;
    actualAngle: number;
    errorMessage: string;
    scheduleDetail: ScheduleDetail;
    jointLists: JointList[];
}
