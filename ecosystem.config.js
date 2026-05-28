module.exports = {
  apps: [
    {
      name: "worldcup-prediction-platform",
      script: "./dist/server.cjs",
      instances: 1,
      exec_mode: "fork",
      watch: false,
      env: {
        NODE_ENV: "production",
        PORT: 3000,
        JWT_SECRET: "worldcup_secret_key_2026_production_vps_high_security"
      }
    }
  ]
};
