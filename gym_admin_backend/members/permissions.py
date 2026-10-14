from rest_framework.permissions import BasePermission

from members.models import GymUserProfile


def get_user_role(user):
    if not user or not user.is_authenticated:
        return None

    profile = getattr(user, 'gym_profile', None)
    # Existing accounts created before roles were introduced remain fully usable.
    return profile.role if profile else GymUserProfile.OWNER


class HasGymRole(BasePermission):
    allowed_roles = ()
    message = 'You do not have permission to perform this action.'

    def has_permission(self, request, view):
        return get_user_role(request.user) in self.allowed_roles


class OwnerOnly(HasGymRole):
    allowed_roles = (GymUserProfile.OWNER,)


class OwnerOrFrontDesk(HasGymRole):
    allowed_roles = (GymUserProfile.OWNER, GymUserProfile.FRONT_DESK)


class MemberViewer(HasGymRole):
    allowed_roles = (
        GymUserProfile.OWNER,
        GymUserProfile.TRAINER,
        GymUserProfile.FRONT_DESK,
    )
