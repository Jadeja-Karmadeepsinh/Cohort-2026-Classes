import { channel } from 'node:diagnostics_channel';
import { publisher, subscriber, redis } from './reddis-connection.js';

const CHECKBOX_SIZE = 100;
const CHECKBOX_STATE_KEY = 'checkbox-state';

async function name(data) {
    const exsistingState = await redis.get(CHECKBOX_STATE_KEY);

    if(exsistingState) {
        const remoteData = JSON.parse(exsistingState);
        remoteData[data.id] = data.checked;
        await redis.set(CHECKBOX_STATE_KEY, JSON.stringify(remoteData));
    }else {
        await redis.set(CHECKBOX_STATE_KEY, JSON.stringify(new Array(CHECKBOX_SIZE).fill(false)));
    }

    await publisher.publish('internal-server:checkbox:change', JSON.stringify(data));
                            //chenal name                       //data
}

//on server start before socket connection in main function
await subscriber.subscribe('internal-server:checkbox:change');
subscriber.on('message', (channel, message) => {
    if(channel === 'internal-server:checkbox:change') {
        const { id, checked } = JSON.parse(message);

        //now you dont even need to store data in state or anything just emit the socket event with id and index and thats it
        io.emit('eventname', { id, checked });
        //! learn that wether we can use broadcast here or not like if some socket is emiting checkbox change that that socket already updated its checkbox then i guess we dont need to send event to that socket again because of io.emit
    }
});

//create a seperate function to update the state