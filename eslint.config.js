module.exports = [
  {
    "rules": {
      "no-console": [
        "warn",
        {
          "allow": [
            "warn",
            "error"
          ]
        }
      ],
      "no-restricted-imports": [
        "warn",
        {
          "patterns": [
            "node-fetch"
          ]
        }
      ],
      "@typescript-eslint/explicit-function-return-type": [
        "warn"
      ],
      "no-magic-numbers": [
        "warn",
        {
          "ignore": [
            0,
            1
          ]
        }
      ],
      "max-lines": [
        "warn",
        {
          "max": 300
        }
      ],
      "no-process-env": [
        "error"
      ],
      "@typescript-eslint/naming-convention": [
        "warn"
      ],
      "no-debugger": [
        "error"
      ]
    }
  }
];
