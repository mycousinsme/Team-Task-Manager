const { Project, User, Task, ProjectMember } = require('../models');

exports.getAll = async (req, res) => {
  try {
    let projects;
    if (req.user.role === 'admin') {
      projects = await Project.findAll({ include: [{ model: User, as: 'owner', attributes: ['id','name','email'] }, { model: User, as: 'members', attributes: ['id','name','email'], through: { attributes: ['role'] } }] });
    } else {
      projects = await Project.findAll({
        include: [
          { model: User, as: 'owner', attributes: ['id','name','email'] },
          { model: User, as: 'members', attributes: ['id','name','email'], through: { attributes: ['role'] }, where: { id: req.user.id }, required: true }
        ]
      });
    }
    res.json(projects);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.getOne = async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id, {
      include: [
        { model: User, as: 'owner', attributes: ['id','name','email'] },
        { model: User, as: 'members', attributes: ['id','name','email'], through: { attributes: ['role'] } },
        { model: Task, as: 'tasks', include: [{ model: User, as: 'assignee', attributes: ['id','name'] }] }
      ]
    });
    if (!project) return res.status(404).json({ error: 'Project not found' });
    res.json(project);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.create = async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ error: 'Name required' });
    const project = await Project.create({ name, description, createdBy: req.user.id });
    await ProjectMember.create({ projectId: project.id, userId: req.user.id, role: 'admin' });
    res.status(201).json(project);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.update = async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id);
    if (!project) return res.status(404).json({ error: 'Not found' });
    if (project.createdBy !== req.user.id && req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
    await project.update(req.body);
    res.json(project);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.remove = async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id);
    if (!project) return res.status(404).json({ error: 'Not found' });
    if (project.createdBy !== req.user.id && req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
    await project.destroy();
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.addMember = async (req, res) => {
  try {
    const { userId, role } = req.body;
    const project = await Project.findByPk(req.params.id);
    if (!project) return res.status(404).json({ error: 'Not found' });
    if (project.createdBy !== req.user.id && req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
    const [member, created] = await ProjectMember.findOrCreate({ where: { projectId: project.id, userId }, defaults: { role: role || 'member' } });
    res.json(member);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.removeMember = async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id);
    if (!project) return res.status(404).json({ error: 'Not found' });
    if (project.createdBy !== req.user.id && req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
    await ProjectMember.destroy({ where: { projectId: project.id, userId: req.params.userId } });
    res.json({ message: 'Removed' });
  } catch (err) { res.status(500).json({ error: err.message }); }
};
