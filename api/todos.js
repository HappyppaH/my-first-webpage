const fs = require('fs');
const path = require('path');

// 使用 /tmp 目录（Vercel 唯一可写的目录）
const DATA_FILE = path.join('/tmp', 'data.json');

// 初始化数据文件（如果不存在）
function initDataFile() {
    if (!fs.existsSync(DATA_FILE)) {
        const defaultTodos = [
            { id: 1, text: '学习 Node.js', completed: false },
            { id: 2, text: '写一个全栈项目', completed: false }
        ];
        fs.writeFileSync(DATA_FILE, JSON.stringify(defaultTodos, null, 2), 'utf-8');
    }
}

function readTodos() {
    initDataFile();
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(raw);
}

function writeTodos(todos) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(todos, null, 2), 'utf-8');
}

module.exports = (req, res) => {
    // 设置 CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // 处理预检请求
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // 解析 URL，格式可能是 /api/todos 或 /api/todos/123
    const urlParts = req.url.replace(/^\/+|\/+$/g, '').split('/');
    // urlParts 示例: ['api', 'todos'] 或 ['api', 'todos', '123']
    const id = urlParts.length > 2 ? parseInt(urlParts[urlParts.length - 1]) : null;

    try {
        // GET：获取所有事项
        if (req.method === 'GET') {
            const todos = readTodos();
            return res.status(200).json(todos);
        }

        // POST：新增事项
        if (req.method === 'POST') {
            const todos = readTodos();
            const newTodo = req.body;
            if (!newTodo || !newTodo.text) {
                return res.status(400).json({ error: '缺少 text 字段' });
            }
            newTodo.id = todos.length > 0 ? todos[todos.length - 1].id + 1 : 1;
            newTodo.completed = newTodo.completed || false;
            todos.push(newTodo);
            writeTodos(todos);
            return res.status(201).json(newTodo);
        }

        // PATCH：更新完成状态
        if (req.method === 'PATCH' && id) {
            const todos = readTodos();
            const todo = todos.find(t => t.id === id);
            if (todo) {
                todo.completed = req.body.completed;
                writeTodos(todos);
                return res.status(200).json(todo);
            }
            return res.status(404).json({ error: '事项不存在' });
        }

        // DELETE：删除事项
        if (req.method === 'DELETE' && id) {
            const todos = readTodos();
            const index = todos.findIndex(t => t.id === id);
            if (index !== -1) {
                todos.splice(index, 1);
                writeTodos(todos);
                return res.status(200).json({ message: '删除成功' });
            }
            return res.status(404).json({ error: '事项不存在' });
        }

        // 其他情况
        return res.status(404).json({ error: '路由不存在' });
    } catch (err) {
        console.error('服务器错误:', err);
        return res.status(500).json({ error: '服务器内部错误', details: err.message });
    }
};