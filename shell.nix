let
  pkgs = import <nixpkgs> {};
in
  pkgs.mkShell {
    packages = with pkgs; [
      inotify-tools
      sassc
      nodejs
      esbuild
    ];
  }
