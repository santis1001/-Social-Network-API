const { User, Thought } = require('../models');

const thoughtController = {
    async getAllThought(req, res) {
        try {
            const thought = await Thought.find();
            res.json(thought);
        } catch (err) {
            console.log(err);
            return res.status(500).json(err);
        }
    },
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
    },
    async createThought(req, res) {

        const user = await User.findById(req.body.userId);
        if (!user) {
            return res.status(404).json({ message: 'No user with that ID' });
        }

        const thought = await Thought.create(req.body);

        user.thoughts.push(thought._id);
        await user.save();

        res.json(thought);
    },
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
    },
    async deleteThought(req, res) {
        try {
            const thought = await Thought.findOneAndRemove({ _id: req.params.thoughtId });
            if (!thought) {
                res.status(404).json({ message: 'No thoughts found with that ID' });
            }
            const user = User.findOneAndUpdate(
                { _id: thought.userId },
                { $pull: { thoughts: req.params.thoughtId } },
                { new: true }
            );
            res.json(thought);
        } catch (err) {
            console.log(err);
            return res.status(500).json(err);
        }
    },
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
    },
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
    },
};

module.exports = thoughtController;