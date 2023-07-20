# Social-Network-API

## Description

## User Story

```md
AS A social media startup
I WANT an API for my social network that uses a NoSQL database
SO THAT my website can handle large amounts of unstructured data
```

## Acceptance Criteria

```md
GIVEN a social network API
WHEN I enter the command to invoke the application
THEN my server is started and the Mongoose models are synced to the MongoDB database
WHEN I open API GET routes in Insomnia for users and thoughts
THEN the data for each of these routes is displayed in a formatted JSON
WHEN I test API POST, PUT, and DELETE routes in Insomnia
THEN I am able to successfully create, update, and delete users and thoughts in my database
WHEN I test API POST and DELETE routes in Insomnia
THEN I am able to successfully create and delete reactions to thoughts and add and remove friends to a user’s friend list
```

## Usage
### Set up project
```
> npm i
```

### Install MongoDB Controller
```
> npm install mongoose
```
### Run Dev Server
Prefill the database with mock data.
```
> npm run dev
```
### Start the Server
Start the server.
```
> npm start
```
## Database Structure
MongoDB document schema as a table.

### User
```
+--------------+-------------+-----------+--------+-----------+---------------+
| Field        | Type        | Required  | Unique | Max Length| Reference     |
+--------------+-------------+-----------+--------+-----------+---------------+
| username     | String      | true      | true   | 50        |               |
| email        | String      | true      | true   | 50        |               |
| thoughts     | [ObjectId]  |           |        |           | 'Thought'     |
| friends      | [ObjectId]  |           |        |           | 'User'        |
+--------------+-------------+-----------+--------+-----------+---------------+
```


### Thought
```
+--------------+-------------+-----------+--------+-----------+---------------+
| Field        | Type        | Required  | Unique | Max Length| Reference     |
+--------------+-------------+-----------+--------+-----------+---------------+
| thoughtText  | String      | true      |        | 280       |               |
| createdAt    | Date        |           |        |           |               |
| username     | String      | true      |        | 50        |               |
| userId       | ObjectId    |           |        |           |               |
| reactions    | [reaction]  |           |        |           | 'Reaction'    |
+--------------+-------------+-----------+--------+-----------+---------------+
```
### Reaction

```
+--------------+-------------+-----------+--------+-----------+
| Field        | Type        | Required  | Unique | Max Length|
+--------------+-------------+-----------+--------+-----------+
| reactionId   | ObjectId    |           |        |           |
| reactionBody | String      | true      |        | 280       |
| username     | String      | true      |        | 50        |
| createdAt    | Date        |           |        |           |
+--------------+-------------+-----------+--------+-----------+
```
## Code

### User 

**Model**
```js
const userSchema = new Schema(
    {
        username: {
            type: String,
            required: true,
            max_length: 50,
            unique: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            max_length: 50,
            unique: true,
            trim: true,
            match: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        },
        thoughts: [
            {
                type: Schema.Types.ObjectId,
                ref: 'Thought',
            }
        ],
        friends: [
            {
                type: Schema.Types.ObjectId,
                ref: 'User',
            }
        ],
    },
    {
        toJSON: {
            getters: true,
        },
    }
);

const User = model('user', userSchema);
```
**Controller**
```js
async getAllUser(req, res) {
    try {
        const user = await User.find();
        res.json(user);
    } catch (err) {
        console.log(err);
        return res.status(500).json(err);
    }
},
async getUserById(req, res) {
    try {
        const user = await User.findById(req.params.userId)
            .select('-__v');
        if (!user) {
            return res.status(404).json({ message: 'No user with that ID' })
        }
        res.json(user);
    } catch (err) {
        console.log(err);
        return res.status(500).json(err);
    }
}
```

```js
async createUser(req, res) {
    const user = await User.create(req.body);
    res.json(user);
}
```

```js
async updateUser(req, res) {
    try {
        const user = await User.findOneAndUpdate({ _id: req.params.userId }, req.body, { new: true, runValidators: true });
        if (!user) {
            return res.status(404).json({ message: 'No user with that ID' })
        }
        res.json(user);
    } catch (err) {
        res.status(500).json(err);
    }
}
```

```js
async deleteUser(req, res) {
    try {
        const user = await User.findOneAndRemove({ _id: req.params.userId });
        if (!user) {
            return res.status(404).json({ message: 'No user with that ID' })
        }
        const thoughtsToDelete = user.thoughts.map(id => ({ "_id": id }));
        let deleteResult;
        console.log(thoughtsToDelete);
        try {
            deleteResult = await Thought.deleteMany({ $or: thoughtsToDelete });
        } catch (error) {
            console.log(error);
        }
        if (!deleteResult) {
            return res.status(404).json({ message: 'User deleted, but no thoughts found' });
        }

        res.json({ message: 'User successfully deleted' });
    } catch (err) {
        console.log(err);
        res.status(500).json(err);
    }
}
```

```js
async addFriend(req, res) {
    try {
        const friend = await User.findById(req.params.friendId);
        if (!friend) {
            return res.status(404).json({ message: 'No user with that ID' });
        }
        const user = await User.findOneAndUpdate(
            { _id: req.params.userId },
            { $push: { friends: req.params.friendId } },
            { new: true }
        );
        if (!user) {
            return res.status(404).json({ message: 'No user with that ID' })
        }
        res.json(user);
    } catch (err) {
        res.status(500).json(err);
    }
}
```

```js
async deleteFriend(req, res) {
    try {
        const friend = await User.findById(req.params.friendId);
        if (!friend) {
            return res.status(404).json({ message: 'No user with that ID' });
        }
        const user = await User.findOneAndUpdate(
            { _id: req.params.userId },
            { $pull: { friends: req.params.friendId } },
            { new: true }
        );
        if (!user) {
            return res.status(404).json({ message: 'No user with that ID' })
        }
        res.json(user);
    } catch (err) {
        res.status(500).json(err);
    }
}
```
### Thought

**Model**

```js
const thoughtSchema = new Schema(
    {        
        thoughtText: {
            type: String,
            required: true,
            maxlength: 280,
            minlength: 2,
            default: 'empty reaction',
        },
        createdAt: {
            type: Date,
            default: Date.now,
        },
        username: {
            type: String,
            required: true,
            max_length: 50,
        },
        userId: {
            type: Schema.Types.ObjectId,
            default: () => new Types.ObjectId(),
        },
        reactions:[reactionSchema],
    },
    {
        toJSON: {
            getters: true,
        },
        id: false,
    }
);
thoughtSchema.virtual('reactionCount').get(function () {
    return this.reactions.length;
});
const Thought = model('thought', thoughtSchema);
```

**Reaction Model**

```js
const reactionSchema = new Schema(
    {
        reactionId: {
            type: Schema.Types.ObjectId,
            default: () => new Types.ObjectId(),
        },
        reactionBody: {
            type: String,
            required: true,
            maxlength: 280,
            minlength: 2,
            default: 'empty reaction',
        },
        username: {
            type: String,
            required: true,
            max_length: 50,
        },
        createdAt: {
            type: Date,
            default: Date.now,
        },
    },
    {
        toJSON: {
            getters: true,
            virtuals: true,
            transform: function (doc, ret) {
                delete ret._id;
            },
        },
        id: false,
    }
);
```

**Controller**
```js
async getAllThought(req, res) {
    try {
        const thought = await Thought.find();
        res.json(thought);
    } catch (err) {
        console.log(err);
        return res.status(500).json(err);
    }
}
```

```js
async getThoughtById(req, res) {
    try {
        const thought = await Thought.findById(req.params.thoughtId)
            .select('-__v');
        if (!thought) {
            return res.status(404).json({ message: 'No thought with that ID' })
        }
        res.json(thought);
    } catch (err) {
        console.log(err);
        return res.status(500).json(err);
    }
}
```

```js
async createThought(req, res) {

    const user = await User.findById(req.body.userId);
    if (!user) {
        return res.status(404).json({ message: 'No user with that ID' });
    }

    const thought = await Thought.create(req.body);

    user.thoughts.push(thought._id);
    await user.save();

    res.json(thought);
}
```

```js
async updateThought(req, res) {
    try {
        const thought = await Thought.findOneAndUpdate(
            { _id: req.params.thoughtId },
            { thoughtText: req.body.thoughtText },
            { new: true, runValidators: true }
        );
        if (!thought) {
            res.status(404).json({ message: 'No thoughts found with that ID' });
        }
        res.json(thought);
    } catch (err) {
        console.log(err);
        return res.status(500).json(err);
    }
}
```

```js
async deleteThought(req, res) {
    try {
        const thought = await Thought.findOneAndRemove({ _id: req.params.thoughtId });
        if (!thought) {
            res.status(404).json({ message: 'No thoughts found with that ID' });
        }
        const user = await User.findOneAndUpdate(
            { _id: thought.userId },
            { $pull: { thoughts: req.params.thoughtId } },
            { new: true }
        );
        res.json(user);
    } catch (err) {
        console.log(err);
        return res.status(500).json(err);
    }
}
```

```js
async createReaction(req, res) {
    const thought = await Thought.findOneAndUpdate(
        { _id: req.params.thoughtId },
        { $push: { reactions: req.body } },
        { new: true, runValidators: true }
    );
    if (!thought) {
        res.status(404).json({ message: 'No thoughts found with that ID' });
    }
    res.json(thought);
}
```

```js
async deleteReaction(req, res) {
    try {
        const thought = await Thought.findOne({ _id: req.params.thoughtId });
        if (!thought) {
            return res.status(404).json({ message: 'No thought found with that ID' });
        }
        const reaction = thought.reactions.some(
            (reaction) => reaction.reactionId.toString() === req.params.reactionId
        );
        if (!reaction) {
            return res.status(404).json({ message: 'No reaction found with that ID' });
        }
        thought.reactions.pull({ reactionId: req.params.reactionId });
        await thought.save();
        res.json(thought);
    } catch (err) {
        res.status(500).json(err);
    }
}

```


## Video
<sub style='font-weight: bold;'>* This is a preview. Click to watch full video.</sub>
[![Social Network API Video ](./assets/preview.gif)](https://1drv.ms/v/s!Asj9JhD05ulbsx4FH2GL-z0Czl_w?e=b3U6OA)
