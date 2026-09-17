import { redis, publisher } from "../../common/config/redis.js";

const CHECKBOX_KEY = "checkboxes";
const CHECKBOX_CHANNEL = "checkbox:change";

export class CheckBoxRepository {
    static async getCheckbox(
        checkboxId: string
    ) {
        return await redis.hget(CHECKBOX_KEY, checkboxId);
    }   

    static async setCheckbox(
        checkboxId: string,
        checked: boolean
    ) {
        // 1. Store checkbox state in Redis
        await redis.hset(CHECKBOX_KEY, checkboxId, checked ? "1" : "0");

        // 2. Publish the change
        await publisher.publish(CHECKBOX_CHANNEL, JSON.stringify({
            id: checkboxId,
            checked: checked
        }));
    }

    static async getAllCheckboxes() {
        return await redis.hgetall(CHECKBOX_KEY);
    }
}