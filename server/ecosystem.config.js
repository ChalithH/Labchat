module.exports = {
  apps: [
    {
      name: "labchat",
      script: "npm",
      args: "run dev",
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};