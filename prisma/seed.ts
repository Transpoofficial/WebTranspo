import { PrismaClient, Role } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
	const hashedPassword = await bcrypt.hash(
		process.env.ACCOUNT_DEFAULT_PASSWORD || "password123",
		10
	);

	const users = [
		{
			email: "superadmin@example.com",
			role: Role.SUPER_ADMIN,
			password: hashedPassword,
			fullName: "Super Admin User",
			phoneNumber: "1234567890",
		},
		{
			email: "admin@example.com",
			role: Role.ADMIN,
			password: hashedPassword,
			fullName: "Admin User",
			phoneNumber: "0987654321",
		},
		{
			email: "user@example.com",
			role: Role.CUSTOMER,
			password: hashedPassword,
			fullName: "Regular User",
			phoneNumber: "1122334455",
		},
	];

	for (const user of users) {
		await prisma.user.upsert({
			where: { email: user.email },
			update: {},
			create: {
				email: user.email,
				password: user.password,
				role: user.role,
				fullName: user.fullName,
				phoneNumber: user.phoneNumber,
			},
		});
	}
	// Seed vehicle types with capacity
	const vehicleTypes = [
		{
			name: "Angkot",
			capacity: 12,
			pricePerKm: 4100,
		},
		{
			name: "Hiace Commuter",
			capacity: 15,
			pricePerKm: 2500,
		},
		{
			name: "Hiace Premio",
			capacity: 14,
			pricePerKm: 25000,
		},
		{
			name: "Elf",
			capacity: 19,
			pricePerKm: 2500,
		},
	];

	for (const vehicleType of vehicleTypes) {
		const existing = await prisma.vehicleType.findFirst({
			where: { name: vehicleType.name },
		});

		if (existing) {
			await prisma.vehicleType.update({
				where: { id: existing.id },
				data: {
					capacity: vehicleType.capacity,
					pricePerKm: vehicleType.pricePerKm,
				},
			});
		} else {
			await prisma.vehicleType.create({
				data: {
					name: vehicleType.name,
					capacity: vehicleType.capacity,
					pricePerKm: vehicleType.pricePerKm,
				},
			});
		}
	}

	// Seed Achievement data
	const achievements = [
		{
			name: "Runner-Up Goto Impact 2024",
			logoUrl: "/images/achievement/Runner_Up_goto_impact_2024.png",
			displayOrder: 1,
		},
		{
			name: "Finalis SheHacks 2024",
			logoUrl: "/images/achievement/Finalis_SheHacks_2024.png",
			displayOrder: 2,
		},
		{
			name: "Juara 1 Karya Produk Inovatif",
			logoUrl:
				"/images/achievement/juara_1_karya_inovatif_direktorat_inovasi.png",
			displayOrder: 3,
		},
		{
			name: "Finalis KMI EXPO 2024",
			logoUrl: "/images/achievement/finalis_kmi_expo_2024.png",
			displayOrder: 4,
		},
		{
			name: "Big 10 SWC Malang 2025",
			logoUrl: "/images/achievement/Big_10_StartUp_World_Cup_2025.png",
			displayOrder: 5,
		},
	];

	for (const achievement of achievements) {
		// Check if achievement already exists
		const existing = await prisma.achievement.findFirst({
			where: { name: achievement.name },
		});

		if (existing) {
			// Update existing achievement
			await prisma.achievement.update({
				where: { id: existing.id },
				data: {
					logoUrl: achievement.logoUrl,
					displayOrder: achievement.displayOrder,
				},
			});
		} else {
			// Create new achievement
			await prisma.achievement.create({
				data: {
					name: achievement.name,
					logoUrl: achievement.logoUrl,
					displayOrder: achievement.displayOrder,
					isActive: true,
				},
			});
		}
	}

	// Seed TrustedBy data
	const trustedByList = [
		{
			name: "Universitas Negeri Malang",
			logoUrl: "/images/trusted_by/um.png",
			displayOrder: 1,
		},
		{
			name: "Universitas Brawijaya",
			logoUrl: "/images/trusted_by/ub.jpeg",
			displayOrder: 2,
		},
		{
			name: "Universitas Muhammadiyah Malang",
			logoUrl: "/images/trusted_by/umm.png",
			displayOrder: 3,
		},
		{
			name: "Sekolah Tinggi Ilmu Ekonomi Malangkucecwara",
			logoUrl: "/images/trusted_by/stie_malang.png",
			displayOrder: 4,
		},
		{
			name: "Institut Teknologi & Bisnis Asia",
			logoUrl: "/images/trusted_by/institut_asia.png",
			displayOrder: 5,
		},
		{
			name: "Institut Teknologi Nasional Malang",
			logoUrl: "/images/trusted_by/itn.png",
			displayOrder: 6,
		},
		{
			name: "Universitas Islam Negeri Maulana Malik Ibrahim Malang",
			logoUrl: "/images/trusted_by/UIN_MAULANA_MALIK_IBRAHIM.jpg",
			displayOrder: 7,
		},
		{
			name: "Universitas Gajayana Malang",
			logoUrl: "/images/trusted_by/gajayana.png",
			displayOrder: 8,
		},
		{
			name: "Unisma",
			logoUrl: "/images/trusted_by/unisma.png",
			displayOrder: 9,
		},
		{
			name: "Unmer",
			logoUrl: "/images/trusted_by/unmer.png",
			displayOrder: 10,
		},
		{
			name: "Smoore",
			logoUrl: "/images/trusted_by/smoore.webp",
			displayOrder: 11,
		},
		{
			name: "WSE",
			logoUrl: "/images/trusted_by/wse.png",
			displayOrder: 12,
		},
	];

	for (const trusted of trustedByList) {
		// Check if trusted partner already exists
		const existing = await prisma.trustedBy.findFirst({
			where: { name: trusted.name },
		});

		if (existing) {
			// Update existing trusted partner
			await prisma.trustedBy.update({
				where: { id: existing.id },
				data: {
					logoUrl: trusted.logoUrl,
					displayOrder: trusted.displayOrder,
				},
			});
		} else {
			// Create new trusted partner
			await prisma.trustedBy.create({
				data: {
					name: trusted.name,
					logoUrl: trusted.logoUrl,
					displayOrder: trusted.displayOrder,
					isActive: true,
				},
			});
		}
	}

	console.log("Seeding completed!");
}

main()
	.catch((e) => {
		console.error(e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
