export interface PackageEventPayload {
  id: string;
  status: string;
  residentId: string | null;
  recipientName: string | null;
  trackingCode: string | null;
}

export interface PackageEventMap {
  "package:created": PackageEventPayload;
  "package:registration_completed": PackageEventPayload;
  "package:updated": PackageEventPayload;
  "package:delivered": PackageEventPayload;
  "package:receipt_confirmed": PackageEventPayload;
}

export type PackageEventName = keyof PackageEventMap;

export interface SocketEventMap {
  "package:created": (data: PackageEventPayload) => void;
  "package:registration_completed": (data: PackageEventPayload) => void;
  "package:updated": (data: PackageEventPayload) => void;
  "package:delivered": (data: PackageEventPayload) => void;
  "package:receipt_confirmed": (data: PackageEventPayload) => void;
  "notification:new": (data: { userId: string }) => void;
}
