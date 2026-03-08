import {
  pgTable,
  uuid,
  varchar,
  boolean,
  timestamp,
  text,
  jsonb,
  pgEnum,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("user_role", ["MORADOR", "PORTEIRO", "ADMIN"]);

export const packageStatusEnum = pgEnum("package_status", [
  "REGISTRO_PENDENTE",
  "ENTREGA_PENDENTE",
  "ENTREGA_CONCLUIDA",
]);

export const auditActionEnum = pgEnum("audit_action", [
  "CRIACAO",
  "EDICAO",
  "MUDANCA_STATUS",
  "ENTREGA_CONCLUIDA",
  "CONFIRMACAO_RECEBIMENTO",
]);

export const users = pgTable(
  "users",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    email: varchar("email", { length: 255 }).notNull(),
    passwordHash: varchar("password_hash", { length: 255 }).notNull(),
    role: userRoleEnum("role").notNull(),
    phone: varchar("phone", { length: 20 }),
    apartment: varchar("apartment", { length: 20 }),
    block: varchar("block", { length: 20 }),
    mustChangePassword: boolean("must_change_password").default(true).notNull(),
    active: boolean("active").default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [uniqueIndex("users_email_idx").on(table.email)],
);

export const packages = pgTable(
  "packages",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    trackingCode: varchar("tracking_code", { length: 100 }),
    residentId: uuid("resident_id").references(() => users.id),
    recipientName: varchar("recipient_name", { length: 255 }),
    apartment: varchar("apartment", { length: 20 }),
    block: varchar("block", { length: 20 }),
    photoPath: varchar("photo_path", { length: 500 }),
    notes: text("notes"),
    status: packageStatusEnum("status").default("REGISTRO_PENDENTE").notNull(),
    registeredById: uuid("registered_by_id")
      .references(() => users.id)
      .notNull(),
    deliveredById: uuid("delivered_by_id").references(() => users.id),
    receivedById: uuid("received_by_id").references(() => users.id),
    receivedAt: timestamp("received_at", { withTimezone: true }),
    deliveredAt: timestamp("delivered_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("packages_status_idx").on(table.status),
    index("packages_resident_id_idx").on(table.residentId),
    index("packages_tracking_code_idx").on(table.trackingCode),
    index("packages_created_at_idx").on(table.createdAt),
    index("packages_registered_by_id_idx").on(table.registeredById),
    index("packages_delivered_by_id_idx").on(table.deliveredById),
    index("packages_received_by_id_idx").on(table.receivedById),
    index("packages_resident_status_idx").on(table.residentId, table.status),
  ],
);

export const pushSubscriptions = pgTable(
  "push_subscriptions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    endpoint: text("endpoint").notNull(),
    p256dh: text("p256dh").notNull(),
    auth: text("auth").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("push_subscriptions_user_id_idx").on(table.userId),
    uniqueIndex("push_subscriptions_endpoint_idx").on(table.endpoint),
  ],
);

export const notifications = pgTable(
  "notifications",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    body: text("body").notNull(),
    url: varchar("url", { length: 500 }),
    read: boolean("read").default(false).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("notifications_user_id_idx").on(table.userId),
    index("notifications_user_read_idx").on(table.userId, table.read),
  ],
);

export const packageAuditLogs = pgTable(
  "package_audit_logs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    packageId: uuid("package_id")
      .references(() => packages.id, { onDelete: "cascade" })
      .notNull(),
    userId: uuid("user_id")
      .references(() => users.id)
      .notNull(),
    action: auditActionEnum("action").notNull(),
    changes: jsonb("changes"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("audit_logs_package_id_idx").on(table.packageId),
    index("audit_logs_user_id_idx").on(table.userId),
  ],
);
