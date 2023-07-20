const { User, Thought } = require('../models');

const userController = {
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
    },
    async createUser(req, res) {
        const user = await User.create(req.body);
        res.json(user);
    },
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
    },
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
    },
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
    },
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
};

module.exports = userController;