import json
import os
import re
import datetime

DEFAULT_ARCHS = ["all", "arm64-v8a", "armeabi-v7a", "x86", "x86_64"]


def get_output_dir() -> str:
    """获取输出目录（用户交互）"""
    print("===== 初始化输出目录 =====")
    while True:
        output_dir = input("输出路径（留空则保存到当前目录）：").strip()
        if not output_dir:
            output_dir = os.getcwd()
            print(f"输出目录：{output_dir}")
            break
        if os.path.isdir(output_dir):
            break
        create_dir = input(f"路径 {output_dir} 不存在，是否自动创建？(y/n)：").strip().lower()
        if create_dir in ("y", "yes"):
            try:
                os.makedirs(output_dir, exist_ok=True)
                print(f"已创建目录：{output_dir}")
                break
            except Exception as e:
                print(f"创建目录失败：{e}，请重新输入路径！")
        else:
            print("请重新输入有效的输出路径！")
    return output_dir


def get_architectures() -> list[str]:
    """获取架构列表，支持自定义（默认全有）"""
    print("===== 架构配置 =====")
    print(f"默认架构：{', '.join(DEFAULT_ARCHS)}")
    choice = input("是否自定义架构列表？(y/n，默认 n)：").strip().lower()
    if choice in ("y", "yes"):
        custom = input("请输入架构，以逗号分隔（例如：all,arm64-v8a,x86_64）：").strip()
        if custom:
            archs = [a.strip() for a in custom.split(",") if a.strip()]
            print(f"已使用自定义架构：{', '.join(archs)}")
            return archs
        print("输入为空，使用默认架构")
    return DEFAULT_ARCHS.copy()


def get_latest_version(output_dir: str) -> tuple[str, float] | None:
    """扫描输出目录，按文件修改时间返回最新版本号及修改时间戳"""
    json_files = [f for f in os.listdir(output_dir) if f.endswith(".json")]
    if not json_files:
        return None
    latest = max(
        json_files,
        key=lambda f: os.path.getmtime(os.path.join(output_dir, f)),
    )
    mtime = os.path.getmtime(os.path.join(output_dir, latest))
    return latest.removesuffix(".json"), mtime


def load_previous_items(output_dir: str) -> dict[str, dict]:
    """加载最新版本的文件内容，按 arch 索引返回 dict"""
    info = get_latest_version(output_dir)
    if not info:
        return {}
    filepath = os.path.join(output_dir, f"{info[0]}.json")
    try:
        with open(filepath, encoding="utf-8") as f:
            items = json.load(f)
        return {item["arch"]: item for item in items if "arch" in item}
    except Exception:
        return {}


def collect_version(output_dir: str, architectures: list[str]) -> None:
    """
    交互式收集一个版本的信息，生成 JSON 文件。
    输出格式符合数据源规范：{"arch": "...", "url": "..."}
    """
    # 展示最新版本信息（按修改时间）
    latest_info = get_latest_version(output_dir)
    if latest_info:
        version, mtime = latest_info
        dt = datetime.datetime.fromtimestamp(mtime).strftime("%Y-%m-%d %H:%M:%S")
        print(f"最新版本：{version}（修改于 {dt}）")

    # 加载上一版本的 URL 作为参考提示
    prev_items = load_previous_items(output_dir)
    if prev_items:
        print("（上一版本的 URL 会显示在输入提示上方，方便对照修改）")

    # 输入版本名
    while True:
        version_name = input("请输入版本名（例如：1.1.4.5）：").strip()
        if version_name:
            break
        print("错误：版本名不能为空，请重新输入！")

    # 逐个架构收集 URL
    items: list[dict] = []
    print(f"\n输入各架构下载 URL（直接回车跳过该架构，全跳过则取消生成）：")
    for arch in architectures:
        prev = prev_items.get(arch, {})
        prev_url = prev.get("url", "")
        prev_size = prev.get("size")

        if prev_url:
            print(f"  上一版 [{arch}] URL：{prev_url}")

        url = input(f"  [{arch}] URL：").strip()
        if not url:
            print(f"    跳过 {arch}")
            continue

        # 可选文件大小，显示上一版的大小作为参考
        hint = ""
        if prev_size is not None:
            hint = f"（上一版：{prev_size}）"
        size_str = input(f"  [{arch}] 大小（字节，留空跳过）{hint}：").strip()
        item: dict[str, str | int] = {"arch": arch, "url": url}
        if size_str:
            try:
                item["size"] = int(size_str)
            except ValueError:
                print("    大小格式无效，忽略")
        items.append(item)

    if not items:
        print("未输入任何架构的 URL，取消生成。\n")
        return

    # 写入文件
    filename = f"{version_name}.json"
    full_path = os.path.join(output_dir, filename)
    try:
        with open(full_path, "w", encoding="utf-8") as f:
            json.dump(items, f, ensure_ascii=False, indent=2)
        print(f"\n已生成：{full_path}")
        print("内容预览：")
        print(json.dumps(items, ensure_ascii=False, indent=2))
    except Exception as e:
        print(f"写入文件失败：{e}")


def main():
    print("===== 标准架构版本 JSON 生成工具 =====\n")

    output_dir = get_output_dir()
    architectures = get_architectures()

    print("\n开始生成版本文件...")
    while True:
        collect_version(output_dir, architectures)
        again = input("\n是否继续生成下一个版本？(y/n，默认 y)：").strip().lower()
        if again not in ("y", "yes", ""):
            print("程序退出。")
            break


if __name__ == "__main__":
    main()