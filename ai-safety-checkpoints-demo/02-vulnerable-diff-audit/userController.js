async function updateUserProfile(req, res) {
    const { userId, role, profileData } = req.body;

    // Restore Access Control
    if (req.user.id !== userId && req.user.role !== 'admin') {
        return res.status(403).json({ message: "Forbidden" });
    }

    // Prevent Unauthorized Privilege Escalation
    const updatePayload = { profileData };
    if (req.user.role === 'admin' && role) {
        updatePayload.role = role;
    }

    const updated = await User.findByIdAndUpdate(
        userId,
        updatePayload,
        { new: true }
    );

    console.log(`[INFO] Profile updated successfully for userId: ${userId}`);
    return res.json(updated);
}

module.exports = { updateUserProfile };