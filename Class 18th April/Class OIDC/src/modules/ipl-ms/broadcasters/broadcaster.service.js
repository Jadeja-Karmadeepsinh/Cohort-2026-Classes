import Broadcaster from './broadcaster.model.js';
import Season from '../seasons/season.model.js';
import { ApiError } from '../../../common/utils/api-error.js';

export class BroadcasterService {
    static async registerBroadcaster(data) {
        //1. check if the broadcaster already exsists 
        const existingBroadcaster = await Broadcaster.findOne({
            name: data.name
        });

        //2. if exsist then send error conflict
        if (existingBroadcaster) {
            throw ApiError.conflict(
                "A broadcaster with this name already exists"
            );
        }

        //3. if not then create broadcaster
        const broadcaster = await Broadcaster.create(data);

        //4. return broadcaster
        return broadcaster;
    }

    static async getAllBroadcasters() {
        //1. fetch all the broadcasters
        const broadcasters = await Broadcaster.find();

        //2. return all broadcasters
        return broadcasters;
    }

    static async getBroadcasterById(id) {
        //1. check if broadcaster with id exsists in db 
        const broadcaster = await Broadcaster.findById(id);

        //2. if not then send error not found
        if (!broadcaster) {
            throw ApiError.notFound("Broadcaster not found");
        }

        //3. otherwise return broadcaster
        return broadcaster;
    }

    static async updateBroadcasterById(id, data) {
        //1. check if broadcaster with id already exsists or not
        const broadcaster = await Broadcaster.findById(id);

        //2. if not send error not found
        if (!broadcaster) {
            throw ApiError.notFound("Broadcaster not found");
        }

        //3. if exsist and data contains name then check wether same name and id not equal broadcaster exsists 
        if (data.name) {
            const existingBroadcaster = await Broadcaster.findOne({
                name: data.name,
                _id: { $ne: id }
            });

            // 4. If duplicate exists
            if (existingBroadcaster) {
                throw ApiError.conflict(
                    "A broadcaster with this name already exists"
                );
            }
        }
        
        //5. otherwise update broadcaster object and save
        Object.assign(broadcaster, data);

        await broadcaster.save();

        //6. return broadcaster object
        return broadcaster;
    } 

    static async deleteBroadcasterById(id) {
        //1. check if broadcaster with id exsist in db
        const broadcaster = await Broadcaster.findById(id);

        //2. if not then send error not found
        if (!broadcaster) {
            throw ApiError.notFound("Broadcaster not found");
        }

        //3. if exsists then derefrence broadcaster from season model
        await Season.updateMany(
            { broadcaster: id },
            { $set: { broadcaster: null } }
        );

        //4. delete the broadcaster
        await broadcaster.deleteOne();
    }
}