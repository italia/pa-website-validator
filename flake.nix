{
  description = "Tool di validazione per i siti di comuni e scuole";

  inputs = {
    flake-utils.url = "github:numtide/flake-utils";
    nixpkgs.url = "github:NixOS/nixpkgs/nixpkgs-unstable";
  };

  outputs = { flake-utils, nixpkgs, self }:
    flake-utils.lib.eachDefaultSystem (system:
      let pkgs = import nixpkgs { inherit system; }; in
      {
        devShells.default = pkgs.mkShell {
          packages = [
            pkgs.chromium
            pkgs.cocogitto
            pkgs.jq
            pkgs.nodejs-18_x
            pkgs.pandoc
            pkgs.shellcheck
          ];

          PUPPETEER_EXECUTABLE_PATH = "${pkgs.chromium.outPath}/bin/chromium";
          PUPPETEER_SKIP_DOWNLOAD = "true";
        };
        formatter = pkgs.nixpkgs-fmt;
      }
    );
}
