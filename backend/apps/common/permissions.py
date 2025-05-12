from rest_framework import permissions

class IsOwner(permissions.BasePermission):
    """
    Custom permission to only allow owners of an object to access it.
    """
    def has_object_permission(self, request, view, obj):
        # Check if the user is the owner of the object
        if hasattr(obj, 'user'):
            return obj.user == request.user
        elif hasattr(obj, 'profile'):
            return obj.profile.user == request.user
        return False

class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow owners of an object to edit it.
    """
    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any request,
        # so we'll always allow GET, HEAD or OPTIONS requests.
        if request.method in permissions.SAFE_METHODS:
            return True

        # Write permissions are only allowed to the owner of the object
        if hasattr(obj, 'user'):
            return obj.user == request.user
        elif hasattr(obj, 'profile'):
            return obj.profile.user == request.user
        return False