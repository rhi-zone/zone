{
  description = "flora - Rhizome ecosystem monorepo";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
    spore.url = "github:rhizome-lab/spore";
    nursery.url = "github:rhizome-lab/nursery";
  };

  outputs = { self, nixpkgs, flake-utils, spore, nursery }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = nixpkgs.legacyPackages.${system};
        sporePkg = spore.packages.${system}.spore-full;
      in
      {
        packages = {
          # Wisteria Lua source (for use with spore)
          wisteria-src = pkgs.stdenv.mkDerivation {
            pname = "wisteria-src";
            version = "0.1.0";
            src = ./wisteria;
            phases = [ "installPhase" ];
            installPhase = ''
              mkdir -p $out
              cp -r $src/* $out/
            '';
          };

          # Wisteria CLI wrapper
          # TODO: Needs spore-moss integration for full functionality
          wisteria = pkgs.writeShellScriptBin "wisteria" ''
            exec ${sporePkg}/bin/spore run ${self.packages.${system}.wisteria-src} -- "$@"
          '';

          # Iris Lua source (for use with spore)
          iris-src = pkgs.stdenv.mkDerivation {
            pname = "iris-src";
            version = "0.1.0";
            src = ./iris;
            phases = [ "installPhase" ];
            installPhase = ''
              mkdir -p $out
              cp -r $src/* $out/
              # Remove local test files and plugin cache
              rm -rf $out/.spore/plugins $out/test.lua
            '';
          };

          # Iris CLI wrapper
          # TODO: Blocked on spore exposing module plugins to sandbox
          iris = pkgs.writeShellScriptBin "iris" ''
            exec ${sporePkg}/bin/spore run ${self.packages.${system}.iris-src} -- "$@"
          '';

          default = self.packages.${system}.wisteria;
        };

        devShells.default = pkgs.mkShell {
          buildInputs = [
            sporePkg
            nursery.packages.${system}.default
            pkgs.bun
            # Rust for lotus
            pkgs.rustc
            pkgs.cargo
            pkgs.rust-analyzer
            pkgs.pkg-config
            pkgs.openssl
          ];
          # C compiler and linker for native deps
          nativeBuildInputs = [ pkgs.clang pkgs.mold ];
          LIBCLANG_PATH = "${pkgs.llvmPackages.libclang.lib}/lib";
        };
      }
    );
}
