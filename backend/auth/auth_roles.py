from fastapi import Depends, HTTPException, status

from auth.auth_dependency import get_current_user


def require_role(required_role: str):

    def role_checker(
        current_user=Depends(get_current_user)
    ):

        if current_user["role"] != required_role:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to access this resource"
            )

        return current_user

    return role_checker