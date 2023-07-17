const { Schema, Types , model} = require('mongoose');

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

module.exports = Thought;
