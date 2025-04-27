export const findAllUsersResponseExample = {
  users: {
    summary: 'List Users',
    value: [
      {
        userId: '1',
        username: 'john',
        roles: ['user'],
        userRoles: [{ role: { name: 'user' } }],
      },
      {
        userId: '2',
        username: 'alice',
        roles: ['admin'],
        userRoles: [{ role: { name: 'admin' } }],
      },
    ],
  },
};

export const updateRoleRequestExample = {
  admin: {
    summary: 'Update Role Example',
    value: { userId: '123', roles: ['admin', 'user'] },
  },
};

export const updateRoleResponseExample = {
  admin: {
    summary: 'Role Update Success',
    value: {
      userId: '123',
      roles: ['admin', 'user'],
      message: 'Roles updated successfully',
    },
  },
};

export const getMeUserResponseExample = {
  user: {
    summary: 'Current User',
    value: {
      userId: '1',
      username: 'john',
      roles: ['user'],
      userRoles: [{ role: { name: 'user' } }],
    },
  },
};
