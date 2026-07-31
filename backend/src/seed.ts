import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { User } from "./models/User.js";
import { Member } from "./models/Member.js";
import { Event } from "./models/Event.js";
import { DocModel as Document } from "./models/Document.js";
import { Gallery } from "./models/Gallery.js";
import { Notification } from "./models/Notification.js";
import { Contact } from "./models/Contact.js";
import { Opportunity } from "./models/Opportunity.js";
import { Resource } from "./models/Resource.js";
import { Payment } from "./models/Payment.js";
import { Committee } from "./models/Committee.js";
import connectDB from "./config/database.js";

async function seed() {
  try {
    await connectDB();

    // Check if data already exists — skip seeding if so
    const existingUserCount = await User.countDocuments();
    if (existingUserCount > 0) {
      console.log(
        "Database already has data. Skipping seed (re-run only clears if no data exists).",
      );
      await mongoose.disconnect();
      console.log("Disconnected from MongoDB.");
      return;
    }

    console.log("Seeding fresh database...");

    // ── Admin User ─────────────────────────────────────────────
    console.log("Creating admin user...");
    const adminPassword = await bcrypt.hash("superadmin123", 10);
    const admin = await User.create({
      email: "gbaabsuperadmin@gmail.com",
      password: adminPassword,
      firstName: "Super",
      lastName: "Admin",
      role: "superadmin",
      isActive: true,
    });
    console.log(`✓ Admin created: ${admin.email}`);

    // ── Real Members (from Committee Data) ─────────────────────
    console.log("Creating real members...");
    const committeeHeads = [
      "Wasihun Teferi",
      "Tesfaye Abebe",
      "Tolesa Kebede",
      "Duulaa Ajjama",
    ];
    const memberData = [
      {
        firstName: "Wasihun",
        lastName: "Teferi",
        email: "wasihun.teferi@gbaabw.com",
        role: "admin" as const,
        department: "IT",
        designation: "Committee Head - CI",
        phone: "0921323185",
        bio: "Head of CI committee.",
      },
      {
        firstName: "Tesfaye",
        lastName: "Abebe",
        email: "tesfaye.abebe@gbaabw.com",
        role: "admin" as const,
        department: "Pharmacy",
        designation: "Committee Head - Fayyaa",
        phone: "0914231118",
        bio: "Head of Fayyaa committee.",
      },
      {
        firstName: "Tolesa",
        lastName: "Kebede",
        email: "tolesa.kebede@gbaabw.com",
        role: "admin" as const,
        department: "Freshman",
        designation: "Committee Head - Haaraa",
        phone: "0912401668",
        bio: "Head of Haaraa committee.",
      },
      {
        firstName: "Duulaa",
        lastName: "Ajjama",
        email: "duulaa.ajjama@gbaabw.com",
        role: "admin" as const,
        department: "Accounting",
        designation: "Committee Head - FB",
        phone: "0914411496",
        bio: "Head of FB committee.",
      },
      {
        firstName: "Tolesa",
        lastName: "Tesfaye",
        email: "tolesa.tesfaye@gbaabw.com",
        role: "student" as const,
        department: "Software",
        designation: "Member",
        phone: "0975863448",
        bio: "CI committee member.",
      },
      {
        firstName: "Aster",
        lastName: "Ketema",
        email: "aster.ketema@gbaabw.com",
        role: "student" as const,
        department: "Computer Science",
        designation: "Member",
        phone: "0913688115",
        bio: "CI committee member.",
      },
      {
        firstName: "Sannayit",
        lastName: "Baqqala",
        email: "sannayit.baqqala@gbaabw.com",
        role: "student" as const,
        department: "GIS",
        designation: "Member",
        phone: "0996612005",
        bio: "CI committee member.",
      },
      {
        firstName: "Tigisti",
        lastName: "Taklu",
        email: "tigisti.taklu@gbaabw.com",
        role: "student" as const,
        department: "GIS",
        designation: "Member",
        phone: "0980175917",
        bio: "CI committee member.",
      },
      {
        firstName: "Peniel",
        lastName: "Bacha",
        email: "peniel.bacha@gbaabw.com",
        role: "student" as const,
        department: "Software",
        designation: "Member",
        phone: "0913884804",
        bio: "CI committee member.",
      },
      {
        firstName: "Daagim",
        lastName: "Kabbada",
        email: "daagim.kabbada@gbaabw.com",
        role: "student" as const,
        department: "Software",
        designation: "Member",
        phone: "0910469276",
        bio: "CI committee member.",
      },
      {
        firstName: "Abbay",
        lastName: "Caalaa",
        email: "abbay.caalaa@gbaabw.com",
        role: "student" as const,
        department: "Software Engineering",
        designation: "Member",
        phone: "0949324128",
        bio: "CI committee member.",
      },
      {
        firstName: "Tigisti",
        lastName: "Gonfa",
        email: "tigisti.gonfa@gbaabw.com",
        role: "student" as const,
        department: "Pharmacy",
        designation: "Member",
        phone: "0923681415",
        bio: "Fayyaa committee member.",
      },
      {
        firstName: "Birhanuu",
        lastName: "Tolcha",
        email: "birhanuu.tolcha@gbaabw.com",
        role: "student" as const,
        department: "Medical Lab",
        designation: "Member",
        phone: "0940041316",
        bio: "Fayyaa committee member.",
      },
      {
        firstName: "Milkeessa",
        lastName: "Eshetu",
        email: "milkeessa.eshetu@gbaabw.com",
        role: "student" as const,
        department: "Medical Lab",
        designation: "Member",
        phone: "0933455580",
        bio: "Fayyaa committee member.",
      },
      {
        firstName: "Tassamma",
        lastName: "Caalaa",
        email: "tassamma.caalaa@gbaabw.com",
        role: "student" as const,
        department: "Bio Medical",
        designation: "Member",
        phone: "0912345678",
        bio: "Fayyaa committee member.",
      },
      {
        firstName: "Birhanuu",
        lastName: "Galata",
        email: "birhanuu.galata@gbaabw.com",
        role: "student" as const,
        department: "Electrical",
        designation: "Member",
        phone: "0912720271",
        bio: "Techno committee member.",
      },
      {
        firstName: "Seefu",
        lastName: "Urgea",
        email: "seefu.urgea@gbaabw.com",
        role: "student" as const,
        department: "Chemical Engineering",
        designation: "Member",
        phone: "0913884804",
        bio: "Techno committee member.",
      },
      {
        firstName: "Oliiqaa",
        lastName: "Girma",
        email: "oliiqaa.girma@gbaabw.com",
        role: "student" as const,
        department: "Chemical Engineering",
        designation: "Member",
        phone: "0910193599",
        bio: "Techno committee member.",
      },
      {
        firstName: "Baayisa",
        lastName: "Birhanuu",
        email: "baayisa.birhanuu@gbaabw.com",
        role: "student" as const,
        department: "Chemical Engineering",
        designation: "Member",
        phone: "0935914102",
        bio: "Techno committee member.",
      },
      {
        firstName: "Abdii",
        lastName: "Addunya",
        email: "abdii.addunya@gbaabw.com",
        role: "student" as const,
        department: "Civil Engineering",
        designation: "Member",
        phone: "0970954616",
        bio: "Techno committee member.",
      },
      {
        firstName: "Magarsaa",
        lastName: "Dhuguma",
        email: "magarsaa.dhuguma@gbaabw.com",
        role: "student" as const,
        department: "M Engineering",
        designation: "Member",
        phone: "0936710168",
        bio: "Techno committee member.",
      },
      {
        firstName: "Balaayi",
        lastName: "Hayiluu",
        email: "balaayi.hayiluu@gbaabw.com",
        role: "student" as const,
        department: "Electrical",
        designation: "Member",
        phone: "0921710522",
        bio: "Techno committee member.",
      },
      {
        firstName: "Iyyu",
        lastName: "Birhanuu",
        email: "iyyu.birhanuu@gbaabw.com",
        role: "student" as const,
        department: "Mechanical Engineering",
        designation: "Member",
        phone: "0912345679",
        bio: "Techno committee member.",
      },
      {
        firstName: "Hacaalu",
        lastName: "Birhanuu",
        email: "hacaalu.birhanuu@gbaabw.com",
        role: "student" as const,
        department: "Electrical",
        designation: "Member",
        phone: "0923795979",
        bio: "Techno committee member.",
      },
    ];

    const memberPassword = await bcrypt.hash("member123", 10);
    const createdUsers = await User.create(
      memberData.map(
        (m: {
          email: string;
          firstName: string;
          lastName: string;
          role: string;
        }) => ({
          email: m.email,
          password: memberPassword,
          firstName: m.firstName,
          lastName: m.lastName,
          role: m.role,
          isActive: true,
        }),
      ),
    );

    const members = await Member.create(
      createdUsers.map(
        (
          u: { _id: any; firstName: any; lastName: any; email: any },
          i: number,
        ) => ({
          userId: u._id,
          fullName: `${u.firstName} ${u.lastName}`,
          email: u.email,
          phone: memberData[i].phone,
          membershipNumber: `GBA/${String(i + 1).padStart(4, "0")}/${new Date().getFullYear()}`,
          membershipStatus: "active" as const,
          joinDate: new Date(Date.now() - (6 - i) * 30 * 24 * 60 * 60 * 1000),
          department: memberData[i].department,
          designation: memberData[i].designation,
          bio: memberData[i].bio,
          profileImage: `https://ui-avatars.com/api/?name=${u.firstName}+${u.lastName}&background=2563eb&color=fff`,
          isPublic: true,
        }),
      ),
    );

    console.log(`✓ ${members.length} members created`);

    // ── Sample Events ──────────────────────────────────────────
    console.log("Creating sample events...");
    const now = new Date();
    const events = await Event.create([
      {
        title: "Annual General Meeting 2026",
        description:
          "Join us for the annual general meeting where we review the past year and plan for the future. All members are expected to attend.",
        date: new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000),
        endDate: new Date(now.getTime() + 61 * 24 * 60 * 60 * 1000),
        location: "GBAABW Headquarters, Accra",
        organizer: admin._id,
        attendees: [
          admin._id,
          ...createdUsers.slice(0, 3).map((u: { _id: any }) => u._id),
        ],
        image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87",
        category: "conference",
        status: "upcoming",
        maxAttendees: 200,
        isPublic: true,
      },
      {
        title: "Leadership Workshop Series",
        description:
          "A hands-on workshop aimed at developing leadership skills among members. Topics include public speaking, team management, and strategic planning.",
        date: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
        endDate: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000),
        location: "Virtual via Zoom",
        organizer: createdUsers[0]._id,
        attendees: createdUsers.map((u) => u._id),
        image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4",
        category: "workshop",
        status: "completed",
        maxAttendees: 50,
        isPublic: true,
      },
      {
        title: "Community Outreach Program",
        description:
          "Giving back to the community through education and mentorship. Volunteers will visit local schools to speak with students.",
        date: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000),
        endDate: new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000),
        location: "Various Schools, Greater Accra Region",
        organizer: createdUsers[1]._id,
        attendees: [
          createdUsers[0]._id,
          createdUsers[2]._id,
          createdUsers[4]._id,
        ],
        image: "https://images.unsplash.com/photo-1559027615-cd4628902d4a",
        category: "social",
        status: "upcoming",
        maxAttendees: 100,
        isPublic: true,
      },
      {
        title: "Financial Literacy Training",
        description:
          "A training session covering personal finance, investment basics, and retirement planning. Open to all members and their families.",
        date: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
        endDate: new Date(
          now.getTime() + 30 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000,
        ),
        location: "GBAABW Conference Room, Accra",
        organizer: createdUsers[3]._id,
        attendees: [],
        image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40",
        category: "training",
        status: "upcoming",
        maxAttendees: 30,
        isPublic: true,
      },
    ]);
    console.log(`✓ ${events.length} events created`);

    // ── Sample Documents ───────────────────────────────────────
    console.log("Creating sample documents...");
    const documents = await Document.create([
      {
        title: "GBAABW Constitution",
        description:
          "The official constitution of the Ghanaian Association of Business and Academic Women. Revised in 2025.",
        fileUrl: "https://docs.google.com/document/d/sample-constitution",
        fileType: "pdf",
        category: "constitution",
        uploadedBy: admin._id,
        accessLevel: "public",
        downloads: 340,
        tags: ["constitution", "governance", "bylaws"],
      },
      {
        title: "Executive Committee Meeting Minutes - January 2026",
        description:
          "Minutes from the January 2026 executive committee meeting.",
        fileUrl: "https://docs.google.com/document/d/sample-minutes",
        fileType: "pdf",
        category: "minutes",
        uploadedBy: createdUsers[2]._id,
        accessLevel: "members",
        downloads: 56,
        tags: ["minutes", "executive", "meeting"],
      },
      {
        title: "Membership Registration Form",
        description: "Form for new members to register with GBAABW.",
        fileUrl: "https://docs.google.com/document/d/sample-form",
        fileType: "doc",
        category: "form",
        uploadedBy: admin._id,
        accessLevel: "public",
        downloads: 120,
        tags: ["membership", "registration", "form"],
      },
    ]);
    console.log(`✓ ${documents.length} documents created`);

    // ── Sample Gallery Albums ──────────────────────────────────
    console.log("Creating sample gallery albums...");
    const galleries = await Gallery.create([
      {
        title: "2025 Annual Banquet",
        description:
          "Photos from our spectacular annual banquet held in December 2025.",
        type: "photo",
        images: [
          {
            url: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622",
            caption: "Opening ceremony",
            uploadedBy: admin._id,
          },
          {
            url: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3",
            caption: "Keynote address",
            uploadedBy: admin._id,
          },
          {
            url: "https://images.unsplash.com/photo-1505236858219-8359eb29e329",
            caption: "Award presentation",
            uploadedBy: createdUsers[4]._id,
          },
          {
            url: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d",
            caption: "Group photo",
            uploadedBy: createdUsers[4]._id,
          },
        ],
        videos: [],
        coverImage:
          "https://images.unsplash.com/photo-1511795409834-ef04bbd61622",
        category: "event",
        uploadedBy: admin._id,
        isPublic: true,
      },
      {
        title: "Community Outreach Highlights",
        description:
          "A video compilation of our community outreach activities throughout the year.",
        type: "video",
        images: [],
        videos: [
          {
            url: "https://www.youtube.com/watch?v=sample-outreach",
            title: "Outreach Summary 2025",
            uploadedBy: admin._id,
          },
        ],
        coverImage: "https://images.unsplash.com/photo-1559027615-cd4628902d4a",
        category: "event",
        uploadedBy: createdUsers[1]._id,
        isPublic: true,
      },
    ]);
    console.log(`✓ ${galleries.length} gallery albums created`);

    // ── Sample Notifications ──────────────────────────────────
    console.log("Creating sample notifications...");
    const notifications = await Notification.create([
      {
        recipient: admin._id,
        type: "system",
        title: "Welcome to GBAABW",
        message:
          "Welcome to the GBAABW Association Management System. You have been registered as a super admin.",
        link: "/dashboard",
        isRead: true,
        readAt: new Date(now.getTime() - 25 * 24 * 60 * 60 * 1000),
      },
      {
        recipient: createdUsers[0]._id,
        type: "event",
        title: "Upcoming Event: Annual General Meeting",
        message:
          "Reminder: The Annual General Meeting is scheduled for next month. Please confirm your attendance.",
        link: `/events/${events[0]._id}`,
        isRead: false,
      },
      {
        recipient: createdUsers[3]._id,
        type: "membership",
        title: "Membership Renewal Reminder",
        message:
          "Your annual membership is due for renewal. Please complete payment to maintain active status.",
        link: "/membership/renew",
        isRead: false,
      },
      {
        recipient: admin._id,
        type: "announcement",
        title: "New Contact Form Submission",
        message:
          "A new contact form submission has been received. Please review and respond.",
        link: "/contacts",
        isRead: false,
      },
    ]);
    console.log(`✓ ${notifications.length} notifications created`);

    // ── Sample Contact Submissions ─────────────────────────────
    console.log("Creating sample contact submissions...");
    const contacts = await Contact.create([
      {
        name: "Grace Asare",
        email: "grace.asare@example.com",
        subject: "Membership Inquiry",
        message:
          "Hello, I am interested in joining GBAABW. Could you please send me information about membership requirements and fees?",
        type: "general",
        status: "new",
      },
      {
        name: "Dr. Michael Osei",
        email: "michael.osei@university.edu",
        subject: "Partnership Proposal",
        message:
          "I am writing to propose a partnership between GBAABW and the University of Ghana Business School. We have several collaborative initiatives that may interest your members.",
        type: "suggestion",
        status: "replied",
        repliedBy: admin._id,
        reply:
          "Dear Dr. Osei, thank you for reaching out. We would be delighted to explore partnership opportunities. Please let us know a convenient time for a meeting.",
        repliedAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
      },
    ]);
    console.log(`✓ ${contacts.length} contact submissions created`);

    // ── Sample Opportunities ───────────────────────────────────
    console.log("Creating sample opportunities...");
    const opportunities = await Opportunity.create([
      {
        title: "Summer Internship Program 2026",
        description:
          "A 3-month paid internship program for university students. Interns will gain hands-on experience in project management, community engagement, and administration.",
        type: "internship",
        organization: "GBAABW",
        location: "Accra, Ghana",
        eligibility:
          "Currently enrolled university students with at least one year of study remaining.",
        applicationDeadline: new Date(now.getTime() + 45 * 24 * 60 * 60 * 1000),
        applicationLink: "https://gbaabw.com/internship-apply",
        contactEmail: "careers@gbaabw.com",
        postedBy: admin._id,
        status: "active",
        isPublic: true,
      },
      {
        title: "GBAABW Academic Excellence Scholarship",
        description:
          "A merit-based scholarship awarded to outstanding students from the Ghanaian community pursuing higher education.",
        type: "scholarship",
        organization: "GBAABW Education Fund",
        location: "Ghana",
        eligibility:
          "Applicants must be GBAABW members or dependents of members, with a minimum GPA of 3.5.",
        applicationDeadline: new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000),
        applicationLink: "https://gbaabw.com/scholarship-apply",
        contactEmail: "scholarships@gbaabw.com",
        postedBy: createdUsers[0]._id,
        status: "active",
        isPublic: true,
      },
      {
        title: "Community Development Manager",
        description:
          "Full-time position managing community development projects and coordinating with partner organizations.",
        type: "job",
        organization: "GBAABW",
        location: "Accra, Ghana",
        eligibility:
          "Minimum 5 years experience in community development or related field. Master's degree preferred.",
        applicationDeadline: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
        applicationLink: "https://gbaabw.com/careers",
        contactEmail: "hr@gbaabw.com",
        postedBy: admin._id,
        status: "active",
        isPublic: true,
      },
    ]);
    console.log(`✓ ${opportunities.length} opportunities created`);

    // ── Sample Resources ───────────────────────────────────────
    console.log("Creating sample resources...");
    const resources = await Resource.create([
      {
        title: "Introduction to Project Management",
        description:
          "A comprehensive study guide covering the fundamentals of project management, including planning, execution, and monitoring.",
        fileUrl: "https://docs.google.com/document/d/sample-pm-guide",
        type: "study_material",
        subject: "Project Management",
        uploadedBy: admin._id,
        downloads: 45,
        isPublic: true,
      },
      {
        title: "Professional Certification Practice Exam",
        description:
          "Sample questions and answers for the Project Management Professional (PMP) certification exam.",
        fileUrl: "https://docs.google.com/document/d/sample-pmp-exam",
        type: "exam",
        subject: "Professional Development",
        uploadedBy: createdUsers[3]._id,
        downloads: 23,
        isPublic: true,
      },
    ]);
    console.log(`✓ ${resources.length} resources created`);

    // ── Sample Committees ──────────────────────────────────────
    console.log("Creating sample committees...");
    const committees = await Committee.create([
      {
        name: "KOREE KOOLLEEJJII CI",
        head: "Wasihun Teferi",
        description:
          "Barattoonni kun barattoota college computing and informatics barataniidha. Dhuguma dubbachuuf boru gama teekinoloojiin uummata keenya kan tajaajilan barattoota kana keessaa ni bahu jennee abdii qabna. Gama kalaqa waa uumuu gara garaan warreen boru uummata keenya boonsan barattoota koolleejjii kana jala jiraniidha.",
        color: "blue",
        academicYear: "2017",
        members: [
          {
            name: "Wasihun Teferi",
            field: "IT",
            year: "2nd",
            phone: "0921323185",
            campus: "main",
            village: "mugher",
            entry: "2016",
            school: "mugher community",
          },
          {
            name: "Tolesa Tesfaye",
            field: "software",
            year: "3rd",
            phone: "0975863448",
            campus: "main",
            village: "Ejere Naga'o",
            entry: "2015",
            school: "Enchini 2nd school",
          },
          {
            name: "Aster Ketema",
            field: "computer science",
            year: "1st",
            phone: "0913688115",
            campus: "main",
            village: "mugher",
            entry: "2017",
            school: "mugher community",
          },
          {
            name: "Sannayit Baqqala",
            field: "GIS GC",
            year: "",
            phone: "0996612005",
            campus: "main",
            village: "Enchini",
            entry: "2014",
            school: "Enchini 2nd school",
          },
          {
            name: "Tigisti Taklu",
            field: "GIS GC",
            year: "",
            phone: "0980175917",
            campus: "main",
            village: "mugher",
            entry: "2014",
            school: "mugher community",
          },
          {
            name: "peniel Bacha",
            field: "software",
            year: "2nd",
            phone: "0913884804",
            campus: "main",
            village: "mugher",
            entry: "2016",
            school: "mugher community",
          },
          {
            name: "Daagim kabbada",
            field: "software",
            year: "3rd",
            phone: "0910469276",
            campus: "main",
            village: "mugher",
            entry: "2015",
            school: "mugher community",
          },
          {
            name: "Abbay Caalaa",
            field: "software Engineering",
            year: "1st",
            phone: "0949324128",
            campus: "main",
            village: "ulaa Gora",
            entry: "2017",
            school: "Reji 2nd school",
          },
        ],
      },
      {
        name: "KOREE KOOLLEEJJII FAYYAA",
        head: "Tesfaye Abebe",
        description:
          "Barattoonni kun amma barattoota barnoota fayyaa barataniidha. Isaanis boru gama ogummaa fayyaan ogeessota fayyaa ciccimoo fi warreen rakkina uummata isaanii furan ijoollee qaqqaalii Aanaan Ada'aa Bargaa koolleejjii kana jalaa qabduudha.",
        color: "emerald",
        academicYear: "2017",
        members: [
          {
            name: "Tigisti Gonfa",
            field: "Pharmacy",
            year: "1st",
            phone: "0923681415",
            campus: "main",
            village: "mugher",
            entry: "2017",
            school: "mugher community",
          },
          {
            name: "Tasfaaye Abeebe",
            field: "Pharmacy",
            year: "2nd",
            phone: "0914231118",
            campus: "harar",
            village: "senbaro sego",
            entry: "2016",
            school: "Reji 2nd school",
          },
          {
            name: "Birhanuu Tolcha",
            field: "Medical lab",
            year: "2nd",
            phone: "0940041316",
            campus: "harar",
            village: "mugher",
            entry: "2016",
            school: "Reji 2nd school",
          },
          {
            name: "Milkeessa Eshetu",
            field: "Medical lab",
            year: "1st",
            phone: "0933455580",
            campus: "main",
            village: "mugher",
            entry: "2017",
            school: "Reji 2nd school",
          },
          {
            name: "Tassamma Caalaa",
            field: "bio medical E",
            year: "",
            phone: "",
            campus: "main",
            village: "mugher",
            entry: "",
            school: "mugher community",
          },
        ],
      },
      {
        name: "KOREE MOORAA TEchNO",
        head: "Birhaanuu Galataa fi Seefuu Urge",
        description:
          "Barattoonni kuni injineroota warreen barumsa kamiifuu lafee dugdaa ta'an yoo ta'u, Aanaan Ada'aa Bargaa barattoota hedduu fi warreen hangafaa asi qabdi. Injineerri rakkoo biyya isaa sirritti hubatee, furmaata bu'uuraa fi bu'a-qabeessa ta'e uumuun yookiin kalaquun guddina biyyaatiif bu'uura jabaa kaa'a. Ogummaa cimaa, kutannoo fi gumaachi isaan biyyaaf godhan bu'aa guddaa fi kabaja ol'aanaa of keessaa qabuudha. Fakkeenyaaf yoo ilaalle, humna elektirikaa har'a Addunyaan itti fayyadamtu irraa eegalee hanga Konkolaataa, Xiyyaara, Roobootii fi maashinoota ofiin socho'aniitti hundi isaanii hojii injineroonni kalaqaniidha. Kun ammoo, bu'aa yeroo dheeraa fi jijjiirrama lafa qabatee itti fufu fiduu agarsiisa. Injineroonni waan salphaa irratti osoo hin taane, rakkoo bal'aa fi bu'uura qabu sirritti qorachuun, furmaata itti fufaa uumu. Sochii, guddinaa fi badhaadhina Addunyaa kanaa keessatti gahee isaanii malee yaaduun ni ulfaata. Walumaa galatti, Addunyaan Injiineroota malee sochoo'udhaaf yaaluun rakkina guddaa keessa nama galcha.",
        color: "amber",
        academicYear: "2017",
        members: [
          {
            name: "Birhanuu Galata",
            field: "Electrical",
            year: "2nd",
            phone: "0912720271",
            campus: "techno",
            village: "mugher",
            entry: "2016",
            school: "Reji 2nd school",
          },
          {
            name: "Seefu Urgea",
            field: "chemical Engineering",
            year: "2nd",
            phone: "0913884804",
            campus: "techno",
            village: "mugher",
            entry: "2016",
            school: "mugher community",
          },
          {
            name: "Oliiqaa Girma",
            field: "chemical Engineering GC",
            year: "",
            phone: "0910193599",
            campus: "techno",
            village: "Reji",
            entry: "2013",
            school: "mugher community",
          },
          {
            name: "Baayisa Birhanuu",
            field: "chemical Engineering",
            year: "1st",
            phone: "0935914102",
            campus: "main",
            village: "Ejere Naga'o",
            entry: "2017",
            school: "Enchini 2nd school",
          },
          {
            name: "Abdii Addunya",
            field: "civil Engineering",
            year: "1st",
            phone: "0970954616",
            campus: "main",
            village: "Enchini",
            entry: "2017",
            school: "Enchini 2nd school",
          },
          {
            name: "Magarsaa dhuguma",
            field: "m Engineering",
            year: "1st",
            phone: "0936710168",
            campus: "main",
            village: "olonkomii",
            entry: "2017",
            school: "Enchini 2nd school",
          },
          {
            name: "Balaayi Hayiluu",
            field: "Electrical",
            year: "1st",
            phone: "0921710522",
            campus: "techno",
            village: "Haro Boro",
            entry: "2017",
            school: "mugher community",
          },
          {
            name: "Iyyu Birhanuu",
            field: "machanical Engineering",
            year: "",
            phone: "",
            campus: "techno",
            village: "mugher",
            entry: "",
            school: "mugher community",
          },
          {
            name: "Hacaalu Birhanuu",
            field: "Electrical",
            year: "2nd",
            phone: "0923795979",
            campus: "techno",
            village: "Ejere Naga'o",
            entry: "2016",
            school: "Enchini 2nd school",
          },
        ],
      },
      {
        name: "KOREE KOOLLEEJJII FB",
        head: "Duulaa Ajjama",
        description:
          "Barattoonni kunniin immoo warreen gama bizinasii fi ogummaa hojii uumuu gara garaan boru biyyaa fi gamtaa kana boonsaniidha.",
        color: "purple",
        academicYear: "2017",
        members: [
          {
            name: "Duulaa Ajjama",
            field: "Accounting",
            year: "2nd",
            phone: "0914411496",
            campus: "main",
            village: "Enchini",
            entry: "2016",
            school: "Enchini 2nd school",
          },
          {
            name: "koomartisiin Tsegaye",
            field: "Eng Language",
            year: "2nd",
            phone: "0910902530",
            campus: "main",
            village: "Enchini",
            entry: "2016",
            school: "Enchini 2nd school",
          },
          {
            name: "Seifu",
            field: "managment",
            year: "2nd",
            phone: "0914462295",
            campus: "main",
            village: "Ejere Naga'o",
            entry: "2016",
            school: "Enchini 2nd school",
          },
          {
            name: "Girma Tikse",
            field: "Economics",
            year: "2nd",
            phone: "0956615900",
            campus: "main",
            village: "Reji",
            entry: "2016",
            school: "mugher community",
          },
          {
            name: "Milkeessa Sisayi",
            field: "Economics GC",
            year: "",
            phone: "0928235719",
            campus: "main",
            village: "olonkomii",
            entry: "2014",
            school: "Enchini 2nd school",
          },
          {
            name: "Abineezar",
            field: "jornalisim",
            year: "2nd",
            phone: "",
            campus: "techno",
            village: "Enchini",
            entry: "2016",
            school: "Enchini 2nd school",
          },
          {
            name: "Badhaadha dhaaba",
            field: "PADM",
            year: "2nd",
            phone: "0952655925",
            campus: "main",
            village: "ILU DAANSEE",
            entry: "2016",
            school: "Reji 2nd school",
          },
          {
            name: "Itsagannat",
            field: "Accounting",
            year: "2nd",
            phone: "0951751066",
            campus: "main",
            village: "Enchini",
            entry: "2016",
            school: "Enchini 2nd school",
          },
          {
            name: "Tasfaaye mulgeeta",
            field: "E ducational",
            year: "2nd",
            phone: "0937755011",
            campus: "main",
            village: "Ejere Naga'o",
            entry: "2015",
            school: "Enchini 2nd school",
          },
          {
            name: "Ayyalaa Hayilee",
            field: "Afaan oromoo",
            year: "2nd",
            phone: "0906573140",
            campus: "main",
            village: "meetta roobi",
            entry: "2015",
            school: "Enchini 2nd school",
          },
        ],
      },
      {
        name: "KOREE BARATTOOTA HAARAA",
        head: "Tolesa Kebede",
        description:
          "Barattoonni kun barattoota jaalalaa fi obbolummaa gamtaa kanaa dhaga'uun mooraa hangafaa fi addaa kan ta'e Yuunivarsiitii Haramaayaa filannoo jalqabaa godhatanii dhufaniidha. Kanaaf gamtaan keenya barattoonni kun akka boru ogummaa gara garaan dhiibbaa tokko malee iddoo fedhii isaanii galanii ofiif maatii akkasumas biyya isaaniif ifa ta'an gamtaan keenya gama danda'u kamiinuu cinaa dhaabbata.",
        color: "rose",
        academicYear: "2017",
        members: [
          {
            name: "Tolesa kabbada",
            field: "Fresh(social)",
            year: "1st",
            phone: "0912401668",
            campus: "techno",
            village: "Ejere Naga'o",
            entry: "2015",
            school: "Enchini 2nd school",
          },
          {
            name: "Girma Eejersa",
            field: "Fresh(natural)",
            year: "1st",
            phone: "0929147463",
            campus: "techno",
            village: "mugher",
            entry: "2017",
            school: "mugher community",
          },
          {
            name: "Naafyad Taammiru",
            field: "Fresh(natural)",
            year: "1st",
            phone: "0935888729",
            campus: "main",
            village: "Dheku kittoo",
            entry: "2016",
            school: "Holeta 2nd school",
          },
          {
            name: "Abdiisa Caalaa",
            field: "Fresh(social)",
            year: "1st",
            phone: "0929979613",
            campus: "main",
            village: "Reji",
            entry: "2017",
            school: "mugher community",
          },
          {
            name: "Bahiru Girma",
            field: "natural",
            year: "1st",
            phone: "",
            campus: "ecstation",
            village: "mugher",
            entry: "",
            school: "mugher community",
          },
          {
            name: "Ayyaantu Dejene",
            field: "social",
            year: "1st",
            phone: "0992096050",
            campus: "main",
            village: "mugher",
            entry: "2017",
            school: "mugher community",
          },
          {
            name: "Meelat Hayiluu",
            field: "social",
            year: "1st",
            phone: "0902667990",
            campus: "ecstation",
            village: "Enchini",
            entry: "2017",
            school: "Enchini 2nd school",
          },
        ],
      },
    ]);
    console.log(`✓ ${committees.length} committees created`);

    // ── Sample Payments ────────────────────────────────────────
    console.log("Creating sample payments...");
    const payments = await Payment.create([
      {
        member: members[0]._id,
        amount: 100,
        currency: "USD",
        paymentType: "membership_fee",
        paymentMethod: "bank_transfer",
        transactionId: "TXN-" + Date.now() + "-001",
        status: "completed",
        receiptUrl: "https://gbaabw.com/receipts/001",
        notes: "Annual membership fee for 2026",
        paymentDate: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000),
      },
      {
        member: members[1]._id,
        amount: 100,
        currency: "USD",
        paymentType: "membership_fee",
        paymentMethod: "mobile_money",
        transactionId: "TXN-" + Date.now() + "-002",
        status: "completed",
        notes: "Annual membership fee for 2026",
        paymentDate: new Date(now.getTime() - 55 * 24 * 60 * 60 * 1000),
      },
      {
        member: members[2]._id,
        amount: 50,
        currency: "USD",
        paymentType: "event_fee",
        paymentMethod: "cash",
        transactionId: "TXN-" + Date.now() + "-003",
        status: "pending",
        notes: "Leadership Workshop registration fee",
        paymentDate: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
      },
    ]);
    console.log(`✓ ${payments.length} payments created`);

    console.log("");
    console.log("═══════════════════════════════════════════");
    console.log("  Database seeded successfully!");
    console.log("═══════════════════════════════════════════");
    console.log("  Superadmin: gbaabsuperadmin@gmail.com / superadmin123");
    console.log("  Admin login: <any admin email> / member123");
    console.log("  Student login: <any student email> / member123");
    console.log("═══════════════════════════════════════════");
  } catch (error) {
    console.error("Seed failed:", error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB.");
    process.exit(0);
  }
}

seed();
