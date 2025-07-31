const mongoose = require("mongoose");

const confessionSchema = new mongoose.Schema({
    content: {
        type: String,
        required: true,
    },
    authorId: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "pending",
    },
    messageId: {
        type: String,
        default: null,
    },
    threadId: {
        type: String,
        default: null,
    },
    confessionNumber: {
        type: Number,
        default: 0,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// Tự động tăng số thứ tự confession khi được duyệt
confessionSchema.pre("save", async function (next) {
    // Chỉ cập nhật số thứ tự khi confession được duyệt và chưa có số thứ tự
    if (
        this.isModified("status") &&
        this.status === "approved" &&
        this.confessionNumber === 0
    ) {
        const lastApprovedConfession = await this.constructor.findOne(
            { status: "approved" },
            {},
            { sort: { confessionNumber: -1 } }
        );
        this.confessionNumber = lastApprovedConfession
            ? lastApprovedConfession.confessionNumber + 1
            : 1;
    }
    next();
});

module.exports = mongoose.model("Confession", confessionSchema);
