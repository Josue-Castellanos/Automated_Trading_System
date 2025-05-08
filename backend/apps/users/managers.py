from django.contrib.auth.base_user import BaseUserManager
from django.core.exceptions import ValidationError
from django.core.validators import validate_email
from django.utils.translation import gettext_lazy as _


class CustomUserManager(BaseUserManager):
    def email_validator(self, email):
        """Validate email format"""
        try:
            validate_email(email)
        except ValidationError:
            raise ValueError(_('You must provide a valid email address'))

    def create_user(self, username, first_name, last_name, email, password, **extra_fields):
        """
        Creates and saves a regular User with the given email and password.
        """
        if not username:
            raise ValueError(_('Users must submit a username'))
        
        if not first_name:
            raise ValueError(_('Users must submit a first name'))
        
        if not last_name:
            raise ValueError(_('Users must submit a last name'))
        
        if email:
            email = self.normalize_email(email)
            self.email_validator(email)
        else:
            raise ValueError(_('An email address is required'))
        
        extra_fields.setdefault('is_staff', False)
        extra_fields.setdefault('is_superuser', False)
        extra_fields.setdefault('is_active', True)


        user = self.model(
            username=username,
            first_name=first_name,
            last_name=last_name,
            email=email,
            **extra_fields
        )
        
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, username, first_name, last_name, email, password, **extra_fields):
        """
        Creates and saves a superuser with the given email and password.
        """
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError(_('Superuser must have is_staff=True'))
        if extra_fields.get('is_superuser') is not True:
            raise ValueError(_('Superuser must have is_superuser=True'))

        # Create the superuser
        user = self.create_user(
            username,
            first_name,
            last_name,
            email,
            password,
            **extra_fields
        )
        
        user.save(using=self._db)
        return user