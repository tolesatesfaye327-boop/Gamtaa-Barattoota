import express, { Router, Request, Response } from "express";
import { Committee } from "../models/Committee.js";
import { authenticate, authorize } from "../middleware/auth.js";

const router: Router = express.Router();

// Seed committees (admin or superadmin)
router.post(
  "/seed",
  authenticate,
  authorize(["admin", "superadmin"]),
  async (req: Request, res: Response) => {
    try {
      // Check if committees already exist
      const existingCount = await Committee.countDocuments();
      if (existingCount > 0) {
        res.status(400).json({
          message: `Database already has ${existingCount} committees. Delete them first if you want to reseed.`,
        });
        return;
      }

      const committees = [
        {
          name: "KOREE KOOLLEEJJII CI",
          head: "Wasihun Teferi",
          description:
            "Barattoonni kun barattoota college computing and informatics barataniidha. Dhuguma dubbachuuf boru gama teekinoloojiin uummata keenya kan tajaajilan barattoota kana keessaa ni bahu jennee abdii qabna.",
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
          ],
        },
        {
          name: "KOREE MOORAA TEchNO",
          head: "Birhaanuu Galataa fi Seefuu Urge",
          description:
            "Barattoonni kuni injineroota warreen barumsa kamiifuu lafee dugdaa ta'an yoo ta'u, Aanaan Ada'aa Bargaa barattoota hedduu fi warreen hangafaa asi qabdi.",
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
          ],
        },
      ];

      await Committee.insertMany(committees);
      res.status(201).json({
        message: `${committees.length} committees seeded successfully`,
        count: committees.length,
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to seed committees", error });
    }
  },
);

// Get all committees
router.get("/", async (req: Request, res: Response) => {
  try {
    const { academicYear } = req.query;
    const filter: Record<string, string> = {};
    if (academicYear) filter.academicYear = academicYear as string;
    const committees = await Committee.find(filter).sort({ createdAt: -1 });
    res.json(committees);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch committees", error });
  }
});

// Get a single committee by ID
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const committee = await Committee.findById(req.params.id);
    if (!committee) {
      res.status(404).json({ message: "Committee not found" });
      return;
    }
    res.json(committee);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch committee", error });
  }
});

// Create a new committee (admin or superadmin)
router.post(
  "/",
  authenticate,
  authorize(["admin", "superadmin"]),
  async (req: Request, res: Response) => {
    try {
      const { name, head, description, color, members, academicYear } =
        req.body;
      const committee = await Committee.create({
        name,
        head,
        description,
        color,
        members,
        academicYear: academicYear || "2017",
      });
      res
        .status(201)
        .json({ message: "Committee created successfully", committee });
    } catch (error) {
      res.status(500).json({ message: "Failed to create committee", error });
    }
  },
);

// Update a committee (admin or superadmin)
router.patch(
  "/:id",
  authenticate,
  authorize(["admin", "superadmin"]),
  async (req: Request, res: Response) => {
    try {
      const committee = await Committee.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true },
      );
      if (!committee) {
        res.status(404).json({ message: "Committee not found" });
        return;
      }
      res.json({ message: "Committee updated successfully", committee });
    } catch (error) {
      res.status(500).json({ message: "Failed to update committee", error });
    }
  },
);

// Delete a committee (superadmin only)
router.delete(
  "/:id",
  authenticate,
  authorize(["superadmin"]),
  async (req: Request, res: Response) => {
    try {
      const committee = await Committee.findByIdAndDelete(req.params.id);
      if (!committee) {
        res.status(404).json({ message: "Committee not found" });
        return;
      }
      res.json({ message: "Committee deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete committee", error });
    }
  },
);

export default router;
