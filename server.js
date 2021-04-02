const Koa = require('koa');

const server = new Koa();
const httpServer = require('http').createServer(server.callback());
const io = require('socket.io')(httpServer, {
    cors: {
        origin: [
            'http://localhost:4000',
            'http://localhost:5000'
        ],
        methods: [
            'get'
        ]
    }
});
const users = {};

io.on('connection', (socket) => {
    /* Bắt yêu cầu hiển thị thông báo đã vào phòng chat
    của người dùng mới */
    socket.on('new-user-connected', (name) => {
        users[socket.id] = {
            name: name
        }
        /* Gửi yêu cầu thực hiện chức năng hiển thị thông báo có
        người mới đã vào phòng chat tại phía client */
        socket.broadcast.emit('new-user-connected', name);
    })
    /* Bắt yêu cầu hiển thị thông báo đã rời phòng chat
    của người dùng */
    socket.on('disconnect', () => {
        if (users[socket.id] !== undefined) {
            /* Gửi yêu cầu thực hiện chức năng hiển thị thông báo có
            người dùng đã rời phòng chat tại phía client */
            socket.broadcast.emit('user-disconnect', users[socket.id].name);
            delete users[socket.id];
        }
    })
    /* Bắt yêu cầu lấy danh sách người dùng đang có trong phòng chat
    của người dùng */
    socket.on('get-user-online', () => {
        /* Gửi yêu cầu thực hiện chức năng hiển thị danh sách
        ngươi dùng đang có trong phòng chat tại phía client */
        socket.emit('get-user-online', {
            users: users,
            user_id: socket.id
        })
    })
    /* Bắt yêu cầu hiển thị tin nhắn của người dùng */
    socket.on('send-message', (msg) => {
        /* Gửi yêu thực hiện chức năng hiển thị tin nhắn mới tại
        phía client*/
        socket.broadcast.emit('send-message', {
            msg: msg,
            name: users[socket.id].name
        })
    })
    /* Bắt yêu cầu hiển thị thông báo cho người dùng trong phòng chat
    khi người dùng đang nhập */
    socket.on('user-on-typing', () => {
        /* Gửi yêu cầu thực hiện chức năng có 1 người dùng đang nhập
        tại phía client */
        socket.broadcast.emit('user-on-typing', users[socket.id].name)
    })
    /* Bắt yêu cầu hiển thị thông báo cho người dùng trong phòng chat
    khi người dùng đã ngừng nhập */
    socket.on('user-not-typing', () => {
        /* Gửi yêu cầu thực hiện chức năng có 1 người dùng đã ngừng nhập
        tại phía client */
        socket.broadcast.emit('user-not-typing');
    })
})

httpServer.listen(3000, () => {
    console.log('Server running on port 3000')
});