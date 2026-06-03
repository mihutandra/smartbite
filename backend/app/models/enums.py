from enum import Enum


class UserRole(str, Enum):
    ADMIN = "ADMIN"
    USER = "USER"
    MANAGER = "MANAGER"


class OrderStatus(str, Enum):
    ACTIVE = "ACTIVE"
    DONE = "DONE"
