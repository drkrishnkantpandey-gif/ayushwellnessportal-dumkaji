const db = require('../db');

/**
 * Log a Yoga Session
 */
exports.logSession = async (req, res) => {
    const userId = req.user.id;
    const { sessionDate, sessionTime, participantsCount, geotagLocation, addressDisplay } = req.body;
    const photoProofPath = req.file ? req.file.path : null;

    try {
        const result = await db.query(`
      INSERT INTO yoga_sessions (
        user_id, session_date, session_time, participants_count, geotag_location, address_display, photo_proof_path, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'COMPLETED')
      RETURNING *
    `, [userId, sessionDate, sessionTime, participantsCount, geotagLocation, addressDisplay, photoProofPath]);

        res.status(201).json({
            message: 'Yoga session logged successfully.',
            session: result.rows[0]
        });
    } catch (error) {
        console.error('Error logging session:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

/**
 * Get Session History
 */
exports.getSessions = async (req, res) => {
    const userId = req.user.id;
    try {
        const result = await db.query('SELECT * FROM yoga_sessions WHERE user_id = $1 ORDER BY session_date DESC, session_time DESC', [userId]);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching sessions:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

/**
 * Delete a Yoga Session
 */
exports.deleteSession = async (req, res) => {
    const userId = req.user.id;
    const sessionId = req.params.id;

    try {
        const result = await db.query('DELETE FROM yoga_sessions WHERE id = $1 AND user_id = $2 RETURNING *', [sessionId, userId]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Session not found or not authorized' });
        }
        res.json({ message: 'Session deleted successfully' });
    } catch (error) {
        console.error('Error deleting session:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
