# NEXT HMI example projects

Complete HMI projects for [NEXT HMI](https://github.com/mpnvdlee/next-hmi), one
folder each. Download a zip from the latest
[release](https://github.com/mpnvdlee/next-hmi-examples/releases/latest) and import
it in NEXT HMI 1.1.0 or later (Projects → Import project from zip).

| Project | What it shows | Sign-ins | Download |
|---|---|---|---|
| `checkweigher` | Checkweigher: live weight, statistics, reject setup behind an ADMIN PIN; English and Dutch | `admin` / PIN `1234` | [checkweigher.zip](https://github.com/mpnvdlee/next-hmi-examples/releases/latest/download/checkweigher.zip) |

Without a sign-in the project opens as its guest user (Operators group).

The machine is simulated: the checkweigher seeds its values when the HMI loads. To
connect a real machine, point the project's datasource at your OPC-UA server.

Licensed under [MIT-0](LICENSE): use, copy and change freely, no attribution needed.
