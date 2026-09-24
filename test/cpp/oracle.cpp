#include "engines.hpp"

#include <cstdint>
#include <iostream>
#include <string>

std::uint64_t parse_u64(const std::string& value) {
  std::size_t consumed = 0;
  auto result = std::stoull(value, &consumed, 0);

  if (consumed != value.size()) {
    throw std::runtime_error("invalid uint64: " + value);
  }

  return result;
}

template <typename Engine>
void run_values(std::uint64_t seed, std::uint64_t discard, std::uint64_t count) {
  using result_type = typename Engine::result_type;

  Engine engine(static_cast<result_type>(seed));
  engine.discard(discard);

  for (std::uint64_t i = 0; i < count; ++i) {
    std::cout << engine() << '\n';
  }
}

template <typename Engine>
void run_digest(std::uint64_t seed, std::uint64_t discard, std::uint64_t count) {
  using result_type = typename Engine::result_type;

  Engine engine(static_cast<result_type>(seed));
  engine.discard(discard);

  std::uint64_t hash = 14695981039346656037ull;
  std::uint64_t sum = 0;
  std::uint64_t xors = 0;

  for (std::uint64_t i = 0; i < count; ++i) {
    const auto value = static_cast<std::uint64_t>(engine());

    sum += value;
    xors ^= value;

    for (unsigned byte = 0; byte < sizeof(value); ++byte) {
      const auto chunk = (value >> (byte * 8u)) & 0xffu;

      hash ^= chunk;
      hash *= 1099511628211ull;
    }
  }

  std::cout << hash << ' ' << sum << ' ' << xors << '\n';
}

int main() {
  std::string command;
  std::string engine_name;

  std::uint64_t seed;
  std::uint64_t discard;
  std::uint64_t count;

  /*
    * Protocol:
    *
    *   values <engine> <seed> <discard> <count>
    *   digest <engine> <seed> <discard> <count>
    *
    * One request -> one response.
    */
  while (std::cin >> command >> engine_name >> seed >> discard >> count) {
    try {
      bool found = with_engine(engine_name, [&]<typename Engine>() {
        if (command == "values") {
          run_values<Engine>(seed, discard, count);
          return;
        }

        if (command == "digest") {
          run_digest<Engine>(seed, discard, count);
          return;
        }

        throw std::runtime_error("unknown command: " + command);
      });

      if (!found) {
        throw std::runtime_error("unknown engine: " + engine_name);
      }

      std::cout << "END" << std::endl;
    } catch (const std::exception& error) {
      std::cerr << "oracle error: " << error.what() << '\n';
      return 1;
    }
  }

  return 0;
}
