from enum import Enum

class UserType(str, Enum):
    USER = "user"
    ADMIN = "admin"
   #MANAGER = "manager"