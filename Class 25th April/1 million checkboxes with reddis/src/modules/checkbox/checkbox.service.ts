import { CheckBoxRepository } from "./checkbox.repository.js";

export class CheckBoxService {
    static async getAllCheckBoxes() {
        return CheckBoxRepository.getAllCheckboxes();
    }
}