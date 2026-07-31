import express, { Router, Request, Response } from 'express';
import { User } from '../models/User.js';
import { Member } from '../models/Member.js';
import { Event } from '../models/Event.js';
import { DocModel as Document } from '../models/Document.js';
import { Gallery } from '../models/Gallery.js';
import { Payment } from '../models/Payment.js';
import { Contact } from '../models/Contact.js';
import { Opportunity } from '../models/Opportunity.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router: Router = express.Router();

const ADMIN_ROLES = ['superadmin', 'admin'];

// Get dashboard stats
router.get('/stats', authenticate, authorize(ADMIN_ROLES), async (req: Request, res: Response) => {
  try {
    const [
      totalUsers,
      activeMembers,
      inactiveMembers,
      upcomingEvents,
      ongoingEvents,
      completedEvents,
      totalDocuments,
      totalGalleries,
      totalRevenue,
      pendingPayments,
      unreadContacts,
      activeOpportunities,
    ] = await Promise.all([
      User.countDocuments(),
      Member.countDocuments({ isPublic: true }),
      Member.countDocuments({ isPublic: false }),
      Event.countDocuments({ date: { $gte: new Date() }, isPublic: true }),
      Event.countDocuments({ date: { $lte: new Date() }, endDate: { $gte: new Date() }, isPublic: true }),
      Event.countDocuments({ endDate: { $lt: new Date() }, isPublic: true }),
      Document.countDocuments(),
      Gallery.countDocuments(),
      Payment.aggregate([
        { $match: { status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      Payment.countDocuments({ status: 'pending' }),
      Contact.countDocuments({ status: 'new' }),
      Opportunity.countDocuments({ status: 'active' }),
    ]);

    res.json({
      users: totalUsers,
      members: {
        active: activeMembers,
        inactive: inactiveMembers,
        total: activeMembers + inactiveMembers,
      },
      events: {
        upcoming: upcomingEvents,
        ongoing: ongoingEvents,
        completed: completedEvents,
        total: upcomingEvents + ongoingEvents + completedEvents,
      },
      documents: totalDocuments,
      galleries: totalGalleries,
      payments: {
        totalRevenue: totalRevenue[0]?.total || 0,
        pending: pendingPayments,
      },
      contacts: {
        unread: unreadContacts,
        total: await Contact.countDocuments(),
      },
      opportunities: {
        active: activeOpportunities,
        total: await Opportunity.countDocuments(),
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch dashboard stats', error });
  }
});

// Get recent activity
router.get('/recent-activity', authenticate, authorize(ADMIN_ROLES), async (req: Request, res: Response) => {
  try {
    const [recentEvents, recentContacts, recentPayments] = await Promise.all([
      Event.find().sort({ createdAt: -1 }).limit(10).select('title createdAt'),
      Contact.find().sort({ createdAt: -1 }).limit(10).select('name email subject status createdAt'),
      Payment.find().sort({ createdAt: -1 }).limit(10).select('amount paymentType status createdAt'),
    ]);

    const activities: any[] = [];

    recentEvents.forEach((e) =>
      activities.push({ type: 'event', action: 'created', title: e.title, createdAt: e.createdAt })
    );
    recentContacts.forEach((c) =>
      activities.push({ type: 'contact', action: c.status, title: c.subject || c.name, createdAt: c.createdAt })
    );
    recentPayments.forEach((p) =>
      activities.push({ type: 'payment', action: p.status, title: `${p.paymentType} - $${p.amount}`, createdAt: p.createdAt })
    );

    activities.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    res.json(activities.slice(0, 10));
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch recent activity', error });
  }
});

export default router;
