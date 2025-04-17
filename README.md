# Transpo Web Application

This is a private web application project built using [Next.js](https://nextjs.org) as the framework and [Prisma](https://www.prisma.io/) as the ORM. The project is managed with [pnpm](https://pnpm.io/) as the package manager.

---

## 🛠️ Getting Started

Follow these steps to run the project locally:

### 1. Install Dependencies

Ensure you have `pnpm` installed on your system. Then, run the following command to install the required dependencies:

```bash
pnpm install
```

---

### 2. Set Up the Database with Prisma

This project uses Prisma for database management. Complete the following steps to set it up:

1. **Generate the Prisma Client**  
   Run the following command to generate the Prisma client:

   ```bash
   pnpm prisma generate
   ```

2. **Apply Database Migrations**  
   Apply any existing migrations to your database:

   ```bash
   pnpm prisma migrate dev
   ```

3. **Seed the Database**  
   Populate the database with initial data by running the seed script:

   ```bash
   pnpm prisma db seed
   ```

---

### 3. Start the Development Server

Run the development server with the following command:

```bash
pnpm dev
```

---

### 4. Open the Application

Once the server is running, open your browser and navigate to:

[http://localhost:3000](http://localhost:3000)

---

## 🤝 Internal Contribution Guide

This is a private repository. Follow the steps below to contribute to the project:

1. **Choose a Task**

   - Visit the project board and select a task from the `Backlog` column.
   - If no suitable task exists, create a new one.

2. **Move the Task**

   - Move the task to the `Ready` column when you plan to work on it.

3. **Create an Issue**

   - Create an issue linked to the task.

4. **Create a Branch**

   - From the issue, create a new branch using the following naming conventions:
     - `feature/<short-description>` (for new features)
     - `fix/<short-description>` (for bug fixes)
     - `chore/<short-description>` (for maintenance tasks)

5. **Start Coding**

   - Begin development in the new branch and move the task to the `In Progress` column.

6. **Open a Pull Request**

   - Once development is complete, open a pull request and move the task to the `In Review` column.

7. **Address Revisions**

   - If revisions are requested, apply the changes and update the pull request.

8. **Complete the Task**
   - Once the pull request is approved, merge it and move the task to the `Done` column.

---

## 📚 Learn More

- [Next.js Documentation](https://nextjs.org/docs) - Learn about Next.js features and API.
- [Prisma Documentation](https://www.prisma.io/docs) - Learn how to use Prisma in your project.
- [Learn Next.js](https://nextjs.org/learn) - An interactive Next.js tutorial.

---

Happy coding! 🎉
