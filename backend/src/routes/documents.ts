import express, { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { DocModel as Document } from '../models/Document.js';
import { authenticate } from '../middleware/auth.js';

const router: Router = express.Router();

const ADMIN_ROLES = ['superadmin', 'admin'];
const MEMBER_ROLES = [...ADMIN_ROLES, 'student'];

// List documents with tiered access
router.get('/', async (req: Request, res: Response) => {
  try {
    let accessFilter: any = { accessLevel: 'public' };

    const authHeader = req.headers.authorization;
    if (authHeader) {
      try {
        const token = authHeader.split(' ')[1];
        const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'secret');

        if (ADMIN_ROLES.includes(decoded.role)) {
          accessFilter = {};
        } else if (MEMBER_ROLES.includes(decoded.role)) {
          accessFilter = { accessLevel: { $in: ['public', 'members'] } };
        }
      } catch {
        accessFilter = { accessLevel: 'public' };
      }
    }

    if (req.query.category) {
      accessFilter.category = req.query.category;
    }

    const documents = await Document.find(accessFilter)
      .populate('uploadedBy', 'firstName lastName')
      .sort({ createdAt: -1 });

    res.json(documents);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch documents', error });
  }
});

// Get single document
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const document = await Document.findById(req.params.id)
      .populate('uploadedBy', 'firstName lastName');

    if (!document) {
      res.status(404).json({ message: 'Document not found' });
      return;
    }

    res.json(document);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch document', error });
  }
});

// Create document
router.post('/', authenticate, async (req: Request, res: Response) => {
  try {
    const { title, description, fileUrl, fileType, category, accessLevel, tags } = req.body;

    const document = await Document.create({
      title,
      description,
      fileUrl,
      fileType,
      category,
      accessLevel,
      tags,
      uploadedBy: req.userId,
    });

    res.status(201).json({ message: 'Document created successfully', document });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create document', error });
  }
});

// Update document (owner or admin)
router.patch('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) {
      res.status(404).json({ message: 'Document not found' });
      return;
    }

    if (req.userId !== document.uploadedBy.toString() && !ADMIN_ROLES.includes(req.userRole || '')) {
      res.status(403).json({ message: 'Access denied' });
      return;
    }

    const updatedDocument = await Document.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ message: 'Document updated successfully', document: updatedDocument });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update document', error });
  }
});

// Delete document (owner or admin)
router.delete('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) {
      res.status(404).json({ message: 'Document not found' });
      return;
    }

    if (req.userId !== document.uploadedBy.toString() && !ADMIN_ROLES.includes(req.userRole || '')) {
      res.status(403).json({ message: 'Access denied' });
      return;
    }

    await Document.findByIdAndDelete(req.params.id);
    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete document', error });
  }
});

// Increment download count
router.post('/:id/download', async (req: Request, res: Response) => {
  try {
    const document = await Document.findByIdAndUpdate(
      req.params.id,
      { $inc: { downloads: 1 } },
      { new: true }
    );

    if (!document) {
      res.status(404).json({ message: 'Document not found' });
      return;
    }

    res.json({ message: 'Download counted', downloads: document.downloads });
  } catch (error) {
    res.status(500).json({ message: 'Failed to count download', error });
  }
});

export default router;
