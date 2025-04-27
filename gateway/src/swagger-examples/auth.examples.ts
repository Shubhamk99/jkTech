export const registerRequestExample = {
  user: {
    summary: 'Register Example',
    value: { username: 'john', email: 'john@example.com', password: 'secret123' },
  },
};

export const registerResponseExample = {
  user: {
    summary: 'Register Success',
    value: {
      id: '1',
      username: 'john',
      email: 'john@example.com',
      createdAt: '2025-04-27T17:50:00.000Z',
      roles: ['user'],
    },
  },
};

export const loginRequestExample = {
  user: {
    summary: 'Login Example',
    value: { username: 'john', password: 'secret123' },
  },
};

export const loginResponseExample = {
  user: {
    summary: 'Login Success',
    value: {
      access_token: 'jwt.token.here',
      user: {
        id: '1',
        username: 'john',
        roles: ['user'],
      },
    },
  },
};

export const logoutResponseExample = {
  user: {
    summary: 'Logout Success',
    value: {
      message: 'Successfully logged out',
    },
  },
};

export const getMeResponseExample = {
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
