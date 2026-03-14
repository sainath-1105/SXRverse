const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();

const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';
app.use(cors({ origin: CORS_ORIGIN }));
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-cineb-key-1234';


// Setup SQLite DB
const db = new sqlite3.Database('./users.db', (err) => {
    if (err) console.error('Database connection error:', err);
    else {
        console.log('Connected to SQLite database.');
        db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL
        )`);
    }
});

// Auth Routes
app.post('/api/auth/signup', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        // Check if user already exists
        db.get('SELECT email FROM users WHERE email = ?', [email], async (err, row) => {
            if (err) return res.status(500).json({ error: 'Database error' });
            if (row) return res.status(400).json({ error: 'Email already exists' });

            // Hash password and save
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            const stmt = db.prepare('INSERT INTO users (name, email, password) VALUES (?, ?, ?)');
            stmt.run([name, email, hashedPassword], function (err) {
                if (err) return res.status(500).json({ error: 'Failed to create user' });

                const token = jwt.sign({ id: this.lastID }, JWT_SECRET, { expiresIn: '7d' });
                res.status(201).json({ user: { id: this.lastID, name, email }, token });
            });
            stmt.finalize();
        });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

app.post('/api/auth/login', (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
            if (err) return res.status(500).json({ error: 'Database error' });
            if (!user) return res.status(400).json({ error: 'Invalid credentials' });

            const validPassword = await bcrypt.compare(password, user.password);
            if (!validPassword) return res.status(400).json({ error: 'Invalid credentials' });

            const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '7d' });
            res.json({ user: { id: user.id, name: user.name, email: user.email }, token });
        });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Watch Party Rooms Tracker
const activeRooms = {};

app.post('/api/rooms', (req, res) => {
    const { roomName, host, password, media } = req.body;
    let roomId;
    do {
        roomId = Math.random().toString(36).substring(2, 8).toUpperCase();
    } while (activeRooms[roomId]);

    activeRooms[roomId] = {
        id: roomId,
        roomName: roomName || `${host}'s Room`,
        hostName: host,
        password: password || '',
        viewers: 0,
        users: {}, // { socketId: username }
        media: media,
        playing: media || null
    };

    // Broadcast updated rooms list stripped of passwords
    const publicRooms = Object.values(activeRooms).map(r => ({ id: r.id, roomName: r.roomName, host: r.hostName, hasPassword: !!r.password, viewers: r.viewers, media: r.media }));
    io.emit('rooms_updated', publicRooms);

    // Reaper for unjoined rooms: If no one joins within 60 seconds, purge it.
    setTimeout(() => {
        if (activeRooms[roomId] && activeRooms[roomId].viewers <= 0) {
            console.log(`Self-purging unjoined room: ${roomId}`);
            delete activeRooms[roomId];
            const updatedRooms = Object.values(activeRooms).map(r => ({ id: r.id, roomName: r.roomName, host: r.hostName, hasPassword: !!r.password, viewers: r.viewers, media: r.media }));
            io.emit('rooms_updated', updatedRooms);
        }
    }, 60000);

    res.json({ success: true, room: { id: roomId, roomName: activeRooms[roomId].roomName, host, hasPassword: !!password } });
});

app.get('/api/rooms', (req, res) => {
    const publicRooms = Object.values(activeRooms).map(r => ({
        id: r.id,
        roomName: r.roomName,
        host: r.host,
        hasPassword: !!r.password,
        viewers: r.viewers,
        media: r.media
    }));
    res.json(publicRooms);
});

app.post('/api/rooms/verify', (req, res) => {
    const { room, password } = req.body;
    if (!activeRooms[room]) return res.status(404).json({ error: 'Room not found' });
    if (activeRooms[room].password && activeRooms[room].password !== password) {
        return res.status(401).json({ error: 'Incorrect password' });
    }
    res.json({ success: true });
});

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('join_room', (data) => {
        socket.join(data.room);
        socket.roomId = data.room;
        socket.username = data.username || `Guest_${socket.id.substring(0, 4)}`;
        console.log(`User ${socket.username} joined room: ${data.room}`);

        if (activeRooms[data.room]) {
            activeRooms[data.room].viewers += 1;
            activeRooms[data.room].users[socket.id] = socket.username;

            const publicRooms = Object.values(activeRooms).map(r => ({ id: r.id, roomName: r.roomName, host: r.hostName, hasPassword: !!r.password, viewers: r.viewers, media: r.media }));
            io.emit('rooms_updated', publicRooms);

            // Sync video if one is playing
            if (activeRooms[data.room].playing) {
                socket.emit('video_sync', activeRooms[data.room].playing);
            }

            // Update user list in room
            const roomUsers = Object.entries(activeRooms[data.room].users).map(([id, name]) => ({
                id,
                username: name,
                isHost: name === activeRooms[data.room].hostName
            }));
            io.to(data.room).emit('room_users', roomUsers);
        }

        // Announce to others in room
        socket.to(data.room).emit('receive_message', {
            author: 'System',
            message: `${socket.username} has joined the Watch Party! 🎉`,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });
    });

    socket.on('kick_user', (data) => {
        const room = activeRooms[data.room];
        if (room && socket.username === room.hostName) {
            io.to(data.userId).emit('kicked');
            console.log(`Host kicked user ${data.userId} from room ${data.room}`);
        }
    });

    socket.on('send_message', (data) => {
        socket.to(data.room).emit('receive_message', data);
    });

    // Sync basic actions - HOST ONLY
    socket.on('sync_play', (data) => {
        const room = activeRooms[data.room];
        if (room && socket.username === room.hostName) {
            socket.to(data.room).emit('receive_sync_play', data);
        }
    });

    socket.on('sync_pause', (data) => {
        const room = activeRooms[data.room];
        if (room && socket.username === room.hostName) {
            socket.to(data.room).emit('receive_sync_pause', data);
        }
    });

    // Host Video Starter Relay - HOST ONLY
    socket.on('start_video', (data) => {
        const room = activeRooms[data.room];
        if (room && socket.username === room.hostName) {
            console.log(`Host starting video ${data.type} ${data.id} in room ${data.room}`);
            room.playing = { type: data.type, id: data.id };
            io.to(data.room).emit('video_sync', data);
        }
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);

        if (socket.roomId && activeRooms[socket.roomId]) {
            const room = activeRooms[socket.roomId];
            room.viewers -= 1;
            delete room.users[socket.id];

            if (room.viewers <= 0) {
                console.log(`Room ${socket.roomId} is empty. Deleting immediately.`);
                delete activeRooms[socket.roomId];
            } else {
                // Update user list for remaining users
                const roomUsers = Object.entries(room.users).map(([id, name]) => ({
                    id,
                    username: name,
                    isHost: name === room.hostName
                }));
                io.to(socket.roomId).emit('room_users', roomUsers);
            }

            const publicRooms = Object.values(activeRooms).map(r => ({
                id: r.id,
                roomName: r.roomName,
                host: r.hostName,
                hasPassword: !!r.password,
                viewers: r.viewers,
                media: r.media
            }));
            io.emit('rooms_updated', publicRooms);
        }
    });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`SXRverse Socket Server running on port ${PORT}`);
});
