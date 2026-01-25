{
  description = "zone - Rhi ecosystem monorepo";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = nixpkgs.legacyPackages.${system};

        baseInputs = [
          pkgs.bun
          # Rust toolchain
          pkgs.rustc
          pkgs.cargo
          pkgs.rust-analyzer
          pkgs.pkg-config
          pkgs.openssl
          pkgs.sccache
        ];

        baseConfig = {
          nativeBuildInputs = [ pkgs.clang pkgs.mold ];
          LIBCLANG_PATH = "${pkgs.llvmPackages.libclang.lib}/lib";
          RUSTC_WRAPPER = "${pkgs.sccache}/bin/sccache";
        };
      in
      {
        devShells = {
          default = pkgs.mkShell (baseConfig // {
            buildInputs = baseInputs;
            shellHook = ''
              export PATH="$HOME/.cargo/bin:$PATH"

              missing=""
              command -v moonlet >/dev/null 2>&1 || missing="$missing moonlet"
              command -v myenv >/dev/null 2>&1 || missing="$missing myenv"

              if [ -n "$missing" ]; then
                printf '\033[33mMissing tools:%s\033[0m\n' "$missing"
                printf '\033[33mRun: nix develop .#setup\033[0m\n'
              fi
            '';
          });

          setup = pkgs.mkShell (baseConfig // {
            buildInputs = baseInputs;
            shellHook = ''
              export PATH="$HOME/.cargo/bin:$PATH"

              printf '\033[33mInstalling rhi tools (this may take a while on first run)...\033[0m\n'
              cargo install --git https://github.com/rhi-zone/moonlet
              cargo install --git https://github.com/rhi-zone/myenv
              printf '\033[32mDone. Run exit then nix develop to use the tools.\033[0m\n'
            '';
          });
        };
      }
    );
}
