const { Task, User, Project, ProjectMember, Op } = require('../models');
const { Sequelize } = require('sequelize');

exports.getByProject = async (req, res) => {
  try {
    const tasks = await Task.findAll({
      where: { projectId: req.params.projectId },
      include: [
        { model: User, as: 'assignee', attributes: ['id','name','email'] },
        { model: User, as: 'creator', attributes: ['id','name'] }
      ]
    });
    res.json(tasks);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.getDashboard = async (req, res) => {
  try {
    const where = req.user.role === 'admin' ? {} : { assignedTo: req.user.id };
    const now = new Date();
    const tasks = await Task.findAll({
      where,
      include: [
        { model: User, as: 'assignee', attributes: ['id','name'] },
        { model: Project, as: 'project', attributes: ['id','name'] }
      ]
    });
    const overdue = tasks.filter(t => t.dueDate && new Date(t.dueDate) < now && t.status !== 'done');
    const byStatus = { todo: 0, in_progress: 0, done: 0 };
    tasks.forEach(t => byStatus[t.status]++);
    res.json({ tasks, overdue, stats: byStatus, total: tasks.length });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.create = async (req, res) => {
  try {
    const { title, description, status, priority, dueDate, assignedTo, projectId } = req.body;
    if (!title || !projectId) return res.status(400).json({ error: 'Title and projectId required' });
    const task = await Task.create({ title, description, status, priority, dueDate, assignedTo, projectId, createdBy: req.user.id });
    res.status(201).json(task);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.update = async (req, res) => {
  try {
    const task = await Task.findByPk(req.params.id);
    if (!task) return res.status(404).json({ error: 'Not found' });
    // members can only update status of assigned tasks
    if (req.user.role !== 'admin' && task.assignedTo !== req.user.id && task.createdBy !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    await task.update(req.body);
    res.json(task);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.remove = async (req, res) => {
  try {
    const task = await Task.findByPk(req.params.id);
    if (!task) return res.status(404).json({ error: 'Not found' });
    if (task.createdBy !== req.user.id && req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
    await task.destroy();
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
};
