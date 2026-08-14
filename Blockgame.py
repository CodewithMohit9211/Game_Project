import pygame  # pyright: ignore[reportMissingImports]
import random
import sys

# Initialize Pygame
pygame.init()

# Screen dimensions
WIDTH, HEIGHT = 500, 500
screen = pygame.display.set_mode((WIDTH, HEIGHT))
pygame.display.set_caption("Dodge the Blocks")

# Colors
WHITE = (255, 255, 255)
RED = (200, 0, 0)
BLUE = (0, 0, 200)

# Player settings
player_size = 50
player_x = WIDTH // 2
player_y = HEIGHT - player_size - 10
player_speed = 7

# Enemy settings
enemy_size = 50
enemy_speed = 5
enemies = []

# Clock for FPS control
clock = pygame.time.Clock()


def drop_enemy():
    """Create a new enemy at a random x position."""
    x_pos = random.randint(0, WIDTH - enemy_size)
    enemies.append([x_pos, 0])


def draw_enemies():
    """Draw all enemies on the screen."""
    for enemy in enemies:
        pygame.draw.rect(
            screen,
            RED,
            (enemy[0], enemy[1], enemy_size, enemy_size)
        )


def update_enemy_positions():
    """Move enemies down and remove those off-screen."""
    for enemy in enemies:
        enemy[1] += enemy_speed

    enemies[:] = [enemy for enemy in enemies if enemy[1] < HEIGHT]


def detect_collision(player_pos, enemy_pos):
    """Check if player collides with an enemy."""
    px, py = player_pos
    ex, ey = enemy_pos

    return (
        px < ex + enemy_size
        and px + player_size > ex
        and py < ey + enemy_size
        and py + player_size > ey
    )


# Main game loop
score = 0
running = True

while running:
    screen.fill(WHITE)

    # Event handling
    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            running = False

    # Player movement
    keys = pygame.key.get_pressed()

    if keys[pygame.K_LEFT] and player_x > 0:
        player_x -= player_speed

    if keys[pygame.K_RIGHT] and player_x < WIDTH - player_size:
        player_x += player_speed

    # Enemy creation
    if random.randint(1, 20) == 1:
        drop_enemy()

    # Update enemies
    update_enemy_positions()

    # Collision detection
    for enemy in enemies:
        if detect_collision((player_x, player_y), enemy):
            print(f"Game Over! Final Score: {score}")
            running = False

    # Draw player
    pygame.draw.rect(
        screen,
        BLUE,
        (player_x, player_y, player_size, player_size)
    )

    # Draw enemies
    draw_enemies()

    # Update score
    score += 1
    pygame.display.set_caption(f"Dodge the Blocks - Score: {score}")

    # Update screen
    pygame.display.flip()
    clock.tick(30)

pygame.quit()
sys.exit()