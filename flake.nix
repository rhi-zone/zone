{
  description = "zone - Rhi ecosystem monorepo";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
    moonlet.url = "github:rhi-zone/moonlet";
    myenv.url = "github:rhi-zone/myenv";
  };

  outputs = { self, nixpkgs, flake-utils, moonlet, myenv }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = nixpkgs.legacyPackages.${system};
        moonletPkg = moonlet.packages.${system}.moonlet-full;
      in
      {
        packages = {
          # Wisteria Lua source (for use with moonlet)
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
          # TODO: Needs moonlet-moss integration for full functionality
          wisteria = pkgs.writeShellScriptBin "wisteria" ''
            exec ${moonletPkg}/bin/moonlet run ${self.packages.${system}.wisteria-src} -- "$@"
          '';

          # Iris Lua source (for use with moonlet)
          iris-src = pkgs.stdenv.mkDerivation {
            pname = "iris-src";
            version = "0.1.0";
            src = ./iris;
            phases = [ "installPhase" ];
            installPhase = ''
              mkdir -p $out
              cp -r $src/* $out/
              # Remove local test files and plugin cache
              rm -rf $out/.moonlet/plugins $out/test.lua
            '';
          };

          # Iris CLI wrapper
          # TODO: Blocked on moonlet exposing module plugins to sandbox
          iris = pkgs.writeShellScriptBin "iris" ''
            exec ${moonletPkg}/bin/moonlet run ${self.packages.${system}.iris-src} -- "$@"
          '';

          default = self.packages.${system}.wisteria;
        };

        devShells.default = pkgs.mkShell {
          buildInputs = [
            moonletPkg
            myenv.packages.${system}.default
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
